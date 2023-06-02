module.exports.uploadFile = (req, res) => {
  try {
    console.log(req.file.location);

    return res.json({
      url: "https://pngimg.com/uploads/qr_code/qr_code_PNG33.png",
    });
  } catch (error) {
    // console.log(error);
    return res.json({
      url: "https://pngimg.com/uploads/qr_code/qr_code_PNG33.png",
    });
  }
};
