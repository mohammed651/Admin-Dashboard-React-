export const uploadVideoToCloudinary = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const cloudName = "duvg9kaaf";
    if (!cloudName) throw new Error('Cloudinary cloud name not configured');

    const uploadPreset = "mohammedAhmed";
    if (!uploadPreset) throw new Error('Upload preset not configured');

    if (!cloudName || !uploadPreset) {
      return reject(new Error("Cloudinary config missing"));
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    });

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          console.log("Upload response:", res);
          
          resolve({
            url: res.secure_url,
            public_id: res.public_id,
            duration: res.duration?.toString() || "0" // تأكد أنها string
          });
        } else {
          reject(new Error("Upload failed"));
        }
      }
    };

    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
    xhr.send(formData);
  });
};