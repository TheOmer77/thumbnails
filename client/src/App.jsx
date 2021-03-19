import React, { useState } from 'react';

import FileInput from './components/FileInput';

import './App.css';
import './fonts.css';

const handleVideoUpload = async (
  e,
  setFileName,
  onUploadSuccess,
  onUploadFail
) => {
  const file = e.target.files[0];
  if (file) {
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    const uploadReq = await fetch(
      `${process.env.REACT_APP_BACKEND_ADDRESS}/api/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const { success, fileName } = await uploadReq.json();
    if (!success) return onUploadFail(true);
    onUploadFail(false);
    onUploadSuccess(
      `${process.env.REACT_APP_BACKEND_ADDRESS}/api/thumbnail/${fileName}`
    );
  }
};

const App = () => {
  const [fileName, setFileName] = useState('Select file...');
  const [fileUploadFailed, setFileUploadFailed] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState();

  return (
    <div className='container'>
      <h1 className='title'>Video Thumbnail Generator</h1>
      <FileInput
        fileName={fileName}
        onChange={(e) =>
          handleVideoUpload(
            e,
            setFileName,
            setThumbnailUrl,
            setFileUploadFailed
          )
        }
      />
      {fileUploadFailed && (
        <p>That's not the right file type - only mp4 files are supported.</p>
      )}
      {thumbnailUrl && (
        <img src={thumbnailUrl} alt='thumbnail' className='thumbnail-result' />
      )}
    </div>
  );
};

export default App;
