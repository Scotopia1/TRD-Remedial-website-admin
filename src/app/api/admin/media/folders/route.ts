// Media Folders API - List folders, rename folder, delete folder
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-utils'

// GET /api/admin/media/folders - Get all unique folders with counts
export async function GET() {
  try {
    const folders = await prisma.media.groupBy({
      by: ['folder'],
      _count: { id: true },
      orderBy: { folder: 'asc' },
    })

    // Compute total count and unfiled count
    const totalCount = await prisma.media.count()
    const unfiledCount = await prisma.media.count({ where: { folder: null } })

    const folderList = folders
      .filter((f) => f.folder !== null)
      .map((f) => ({
        name: f.folder as string,
        count: f._count.id,
      }))

    return successResponse({
      folders: folderList,
      totalCount,
      unfiledCount,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/admin/media/folders - Rename a folder (updates all media in that folder)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { oldName, newName } = body

    if (!oldName || !newName) {
      return errorResponse('Both oldName and newName are required', 400)
    }

    if (typeof oldName !== 'string' || typeof newName !== 'string') {
      return errorResponse('Folder names must be strings', 400)
    }

    const trimmedNew = newName.trim()
    if (!trimmedNew) {
      return errorResponse('New folder name cannot be empty', 400)
    }

    // Check if the old folder exists
    const existingCount = await prisma.media.count({ where: { folder: oldName } })
    if (existingCount === 0) {
      return errorResponse('Folder not found', 404)
    }

    // Update all media records with the old folder name to the new name
    const result = await prisma.media.updateMany({
      where: { folder: oldName },
      data: { folder: trimmedNew },
    })

    return successResponse({
      message: `Renamed folder "${oldName}" to "${trimmedNew}"`,
      updatedCount: result.count,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/admin/media/folders - Delete a folder (moves media to unfiled, does NOT delete files)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string') {
      return errorResponse('Folder name is required', 400)
    }

    // Set folder to null for all media in this folder
    const result = await prisma.media.updateMany({
      where: { folder: name },
      data: { folder: null },
    })

    return successResponse({
      message: `Deleted folder "${name}". ${result.count} file(s) moved to unfiled.`,
      movedCount: result.count,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
