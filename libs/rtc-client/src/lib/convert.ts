export const encodeChunkWithHeader = (header: any, binaryChunk?: ArrayBuffer | SharedArrayBuffer | undefined): ArrayBuffer => {
  const jsonHeader = JSON.stringify(header);
  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(jsonHeader);
  const headerLength = headerBytes.length;

  const chunk = binaryChunk ?? new ArrayBuffer(0); // Default to empty buffer if undefined

  const buffer = new ArrayBuffer(4 + headerLength + chunk.byteLength);
  const view = new DataView(buffer);

  view.setUint32(0, headerLength); // First 4 bytes = header size
  new Uint8Array(buffer, 4, headerLength).set(headerBytes);
  new Uint8Array(buffer, 4 + headerLength).set(new Uint8Array(chunk));

  return buffer;
};

export type DecodedChunk = {
  header: any;
  chunk: Uint8Array;
};

export const decodeChunkWithHeader = (binaryChunk: ArrayBuffer): DecodedChunk => {
  const view = new DataView(binaryChunk);
  const headerLength = view.getUint32(0); // Read first 4 bytes

  const headerBytes = new Uint8Array(binaryChunk, 4, headerLength);
  const headerText = new TextDecoder().decode(headerBytes);
  const header = JSON.parse(headerText);

  const chunkStart = 4 + headerLength;
  const chunk = new Uint8Array(binaryChunk, chunkStart);

  return { header, chunk };
}