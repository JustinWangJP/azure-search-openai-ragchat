import * as React from "react";
import { Label, PrimaryButton, ProgressIndicator, MessageBar, MessageBarType, TextField, Stack, IconButton, Text } from "@fluentui/react";
import { ArrowUpload24Regular, Document24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import styles from "./Upload.module.css";
import { saveAs } from "file-saver";

interface UploadState {
    files: File[];
    isDragging: boolean;
    isUploading: boolean;
    uploadProgress: number;
    errorMessage: string;
    successMessage: string;
}

export function Component(): JSX.Element {
    const [state, setState] = React.useState<UploadState>({
        files: [],
        isDragging: false,
        isUploading: false,
        uploadProgress: 0,
        errorMessage: "",
        successMessage: ""
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setState(prev => ({ ...prev, isDragging: true }));
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setState(prev => ({ ...prev, isDragging: false }));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setState(prev => ({ ...prev, isDragging: false }));

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        handleFiles(files);
    };

    const handleFiles = (files: File[]) => {
        // ファイルの検証
        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                // 10MB制限
                setState(prev => ({
                    ...prev,
                    errorMessage: "ファイルサイズは10MB以下にしてください。"
                }));
                return false;
            }
            return true;
        });

        setState(prev => ({
            ...prev,
            files: [...prev.files, ...validFiles],
            errorMessage: ""
        }));
    };

    const handleUpload = async () => {
        if (state.files.length === 0) {
            setState(prev => ({
                ...prev,
                errorMessage: "アップロードするファイルを選択してください。"
            }));
            return;
        }

        setState(prev => ({
            ...prev,
            isUploading: true,
            uploadProgress: 0,
            errorMessage: "",
            successMessage: ""
        }));

        try {
            // FormDataを使用してファイルをアップロード
            const formData = new FormData();
            state.files.forEach(file => {
                formData.append("files", file);
            });

            // アップロードの進捗をシミュレート
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                setState(prev => ({ ...prev, uploadProgress: i }));
            }

            setState(prev => ({
                ...prev,
                isUploading: false,
                files: [],
                successMessage: "ファイルのアップロードが完了しました。"
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                isUploading: false,
                errorMessage: "アップロード中にエラーが発生しました。"
            }));
        }
    };

    const removeFile = (index: number) => {
        setState(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const handleDownload = async () => {
        try {
            const response = await fetch("/content/AzureOpenAIとAPIManagementで実現するエンタープライズアーキテクチャ.pdf", {
                method: "POST"
            }).then((response: Response) => response.blob());
            // const response = await axios.post(
            //     "http://localhost:8080/api/download/content",
            //     { documentNames: names },
            //     {
            //         responseType: "blob"
            //     }
            // );
            // ファイルダウンロード処理
            const blob = new Blob([response], { type: "application/pdf" });
            saveAs(blob, "downloaded_documents.pdf");
        } catch (error) {
            console.error("Download Error:", error);
            // setErrorMessage("サーバーエラーが発生しました。");
        }
    };

    return (
        <div className={styles.container}>
            <Label>ファイルダウンロード＆アップロード</Label>
            <Stack tokens={{ childrenGap: 10 }}>
                <h2>ドキュメントダウンロード</h2>
                <PrimaryButton text="ダウンロード" onClick={handleDownload} />
                {state.errorMessage && (
                    <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
                        {state.errorMessage}
                    </MessageBar>
                )}
            </Stack>
            <div
                className={`${styles.dropZone} ${state.isDragging ? styles.dropZoneActive : ""}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <ArrowUpload24Regular />
                <Text>ファイルをドラッグ＆ドロップするか、クリックしてファイルを選択してください</Text>
                <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileInput} multiple />
            </div>

            {state.files.length > 0 && (
                <div className={styles.fileList}>
                    {state.files.map((file, index) => (
                        <div key={index} className={styles.fileItem}>
                            <Document24Regular />
                            <span className={styles.fileName}>{file.name}</span>
                            <IconButton iconProps={{ iconName: "Cancel" }} onClick={() => removeFile(index)} ariaLabel="ファイルを削除">
                                <Dismiss24Regular />
                            </IconButton>
                        </div>
                    ))}
                </div>
            )}

            {state.errorMessage && (
                <MessageBar messageBarType={MessageBarType.error} className={styles.errorMessage}>
                    {state.errorMessage}
                </MessageBar>
            )}

            {state.successMessage && (
                <MessageBar messageBarType={MessageBarType.success} className={styles.successMessage}>
                    {state.successMessage}
                </MessageBar>
            )}

            {state.isUploading && <ProgressIndicator className={styles.progressBar} label="アップロード中..." percentComplete={state.uploadProgress / 100} />}

            <PrimaryButton className={styles.uploadButton} onClick={handleUpload} disabled={state.isUploading || state.files.length === 0}>
                アップロード
            </PrimaryButton>
        </div>
    );
}

Component.displayName = "Upload";
