import ImageKit, { toFile } from '@imagekit/nodejs';

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

export default imagekit;

export async function uploadToImageKit(
  file: Buffer,
  fileName: string,
  folder: string = '/uploads'
): Promise<{
  url: string;
  fileId: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
}> {
  const uploadable = await toFile(file, fileName);

  const response = await imagekit.files.upload({
    file: uploadable,
    fileName: fileName,
    folder: `/trd-website/${folder}`,
    useUniqueFileName: true,
  });

  return {
    url: response.url ?? '',
    fileId: response.fileId ?? '',
    thumbnailUrl: response.thumbnailUrl ?? response.url ?? '',
    width: response.width ?? 0,
    height: response.height ?? 0,
    size: response.size ?? 0,
  };
}

export async function deleteFromImageKit(fileId: string): Promise<void> {
  await imagekit.files.delete(fileId);
}
