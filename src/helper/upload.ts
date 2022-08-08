import path from "path";

export const uploadFile = (req: any, res: any) => {
  
  if (Object.keys(req?.files).length === 0 || !req?.files?.file) {
    return res.status(400).send(errors('No files were uploaded.'));
  }

  const file = req.files.file;
  if (!acceptedMimeType.includes(file.mimetype)) {
    return res.status(400).send(errors(`file type of '${file.mimetype}' is not allowed, try again with any of this image types 'png', 'bmp', 'jpg' , 'jpeg', 'gif'`));
  }

  const extension = path.extname(file.name);
  const rand = 'file_upload' + Math.floor(Math.random() * 999993999999999);
  const uploadPath = path.resolve(__dirname + `../../public/upload/${rand}${extension}`);

  file.mv(uploadPath, (err: any) => {
    if (err) {
      return res.status(500).send(errors(err.message));
    }
    return res.send({ data: { url: `http://localhost:3000/upload/${rand}${extension}` } })
  });
}

const acceptedMimeType: String[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

const errors = (message: string) => {
  return {
    errors: [
      {
        message,
        extensions: {
          code: "UPLOAD_ERROR",
          exception: {
            target: ['upload']
          }
        }
      }
    ],
    data: null
  }
};