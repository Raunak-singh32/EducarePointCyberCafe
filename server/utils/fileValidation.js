const signatures = {
    pdf: (buffer) => buffer.subarray(0, 5).toString() === '%PDF-',
    jpg: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    jpeg: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    png: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    webp: (buffer) => buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP',
    doc: (buffer) => buffer.subarray(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0])),
    docx: (buffer) => buffer.subarray(0, 2).toString() === 'PK'
};

module.exports = (extension, buffer) => Boolean(signatures[extension]?.(buffer));
