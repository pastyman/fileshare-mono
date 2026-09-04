export const encodeChunkWithHeader = (
  header: any,
  binaryChunk?: ArrayBuffer | SharedArrayBuffer | Uint8Array
): ArrayBuffer => {
  const jsonHeader = JSON.stringify(header);
  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(jsonHeader);
  const headerLength = headerBytes.length;

  const chunkBytes =
    binaryChunk instanceof Uint8Array
      ? binaryChunk.byteLength
      : binaryChunk?.byteLength ?? 0;

  const buffer = new ArrayBuffer(4 + headerLength + chunkBytes);
  const view = new DataView(buffer);

  view.setUint32(0, headerLength); // First 4 bytes = header size
  new Uint8Array(buffer, 4, headerLength).set(headerBytes);

  if (binaryChunk instanceof Uint8Array) {
    new Uint8Array(buffer, 4 + headerLength).set(binaryChunk);
  } else if (binaryChunk) {
    new Uint8Array(buffer, 4 + headerLength).set(new Uint8Array(binaryChunk));
  }

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