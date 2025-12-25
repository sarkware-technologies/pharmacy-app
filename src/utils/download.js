import { Platform, Alert, Linking } from "react-native";
import { customerAPI } from "../api/customer";
import Toast from "react-native-toast-message";
import ReactNativeBlobUtil from "react-native-blob-util";

// 🔒 global flag (NO hooks)
let isDownloading = false;

export const downloadDocument = async (s3Path, file, doctypeName) => {
    if (isDownloading) {
        Toast.show({
            type: "info",
            text1: "Download in progress",
            text2: "Please wait for the current download to complete",
            position: "bottom",
        });
        return;
    }

    try {
        isDownloading = true;

        if (!s3Path) {
            Alert.alert("Error", "Document not available");
            return;
        }

        /**
         * ⚠️ Android note:
         * When using Download Manager (`addAndroidDownloads`)
         * storage permission is NOT required on Android 10+
         * So we safely skip permission handling here
         */

        // 1️⃣ Get signed URL
        const response = await customerAPI.getDocumentSignedUrl(s3Path);
        const signedUrl = response?.data?.signedUrl;

        if (!signedUrl) {
            throw new Error("Failed to get download link");
        }

        // 2️⃣ File name & extension
        const fileName = file || doctypeName || "document";
        const fileExtension =
            fileName.split(".").pop()?.toLowerCase() || "";

        const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
            fileExtension
        );
        const isVideo = ["mp4", "mov", "avi", "mkv", "3gp"].includes(
            fileExtension
        );

        const dirs = ReactNativeBlobUtil.fs.dirs;
        let downloadPath;

        if (Platform.OS === "android") {
            if (isImage) downloadPath = dirs.PictureDir;
            else if (isVideo) downloadPath = dirs.MovieDir || dirs.DownloadDir;
            else downloadPath = dirs.DownloadDir;
        } else {
            downloadPath = dirs.DocumentDir;
        }

        const filePath = `${downloadPath}/${fileName}`;

        Toast.show({
            type: "info",
            text1: "Downloading...",
            text2: fileName,
            position: "bottom",
        });

        // 3️⃣ Download
        const res = await ReactNativeBlobUtil.config({
            fileCache: false,
            path: filePath,
            addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                title: fileName,
                description: "Downloading file...",
                mime: getMimeType(fileExtension),
                mediaScannable: true,
                path: filePath,
            },
        }).fetch("GET", signedUrl, {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
        });

        if (!res?.path()) {
            throw new Error("Download failed");
        }

        const exists = await ReactNativeBlobUtil.fs.exists(res.path());
        if (!exists) {
            throw new Error("File not saved");
        }

        Toast.show({
            type: "success",
            text1: "Download Complete",
            text2: `${fileName} saved successfully`,
            position: "bottom",
        });
    } catch (error) {
        console.error("Download error:", error);

        Toast.show({
            type: "error",
            text1: "Download Failed",
            text2: error?.message || "Something went wrong",
            position: "bottom",
            visibilityTime: 5000,
        });
    } finally {
        // 🔁 ALWAYS reset
        isDownloading = false;
    }
};

const getMimeType = (extension = "") => {
    const map = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        bmp: "image/bmp",
        webp: "image/webp",
        pdf: "application/pdf",
        doc: "application/msword",
        docx:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        mkv: "video/x-matroska",
        "3gp": "video/3gpp",
    };

    return map[extension] || "application/octet-stream";
};
