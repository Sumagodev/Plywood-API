import fs from "fs";
import path from "path";

export const storeFileAndReturnNameBase64 = async (base64: string) => {
  try {
    console.log(base64, "base64");

    // Split the base64 string
    const tempBase64 = base64.split(",");
    if (tempBase64.length !== 2) {
      throw new Error("Invalid base64 string");
    }

    // Extract file extension and filename
    const extension = tempBase64[0].split("/")[1].split(";")[0];
    const filename = `${Date.now()}.${extension}`;

    // Define the absolute path to the uploads directory
    const uploadDir = path.join(__dirname, "/api/public/uploads");
    
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Define the full file path
    const filePath = path.join(uploadDir, filename);

    // Write the file
    await new Promise<void>((resolve, reject) => {
      fs.writeFile(filePath, tempBase64[1], "base64", (err) => {
        if (err) {
          console.error("Error writing file:", err);
          reject(err);
        } else {
          console.log("File saved:", filename);
          resolve();
        }
      });
    });

    return filename;
  } catch (error) {
    console.error("Error storing file:", error);
    throw error;
  }
};
