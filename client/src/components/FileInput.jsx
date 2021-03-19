import React from 'react';

import './FileInput.css';

const FileInput = ({ fileName, onChange }) => {
  return (
    <div className='file-input'>
      <label htmlFor='file' className='btn'>
        {fileName}
      </label>
      <input type='file' name='file' id='file' onChange={onChange} />
    </div>
  );
};

export default FileInput;
