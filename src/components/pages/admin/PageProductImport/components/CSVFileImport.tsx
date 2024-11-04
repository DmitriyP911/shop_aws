import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    try {
      console.log("Initiating file upload to:", url);
      const uploadFileName = file?.name || "";

      const presignedUrlResponse = await axios({
        method: "GET",
        url,
        params: {
          name: encodeURIComponent(uploadFileName),
        },
      });

      console.log("File selected for upload:", uploadFileName);
      console.log("Presigned URL for upload:", presignedUrlResponse.data);

      const uploadResult = await fetch(presignedUrlResponse.data.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "text/csv",
        },
        body: file,
      });

      console.log("Upload result:", uploadResult);
      setFile(undefined);
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
