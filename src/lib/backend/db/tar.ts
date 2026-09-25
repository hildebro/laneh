// Minimal tar.gz handling based on web APIs, so database dumps work on the node server and in the offline app alike.

const BLOCK_SIZE = 512;

async function transform(data: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream) {
  const response = new Response(new Blob([data]).stream().pipeThrough(stream));

  return new Uint8Array(await response.arrayBuffer());
}

function writeString(target: Uint8Array, value: string, offset: number, length: number) {
  target.set(new TextEncoder().encode(value).subarray(0, length), offset);
}

function writeOctal(target: Uint8Array, value: number, offset: number, length: number) {
  writeString(target, value.toString(8).padStart(length - 1, '0') + '\0', offset, length);
}

function createHeader(name: string, size: number, mtime: Date): Uint8Array {
  const header = new Uint8Array(BLOCK_SIZE);

  writeString(header, name, 0, 100);
  writeOctal(header, 0o644, 100, 8); // mode
  writeOctal(header, 0, 108, 8); // uid
  writeOctal(header, 0, 116, 8); // gid
  writeOctal(header, size, 124, 12);
  writeOctal(header, Math.floor(mtime.getTime() / 1000), 136, 12);
  writeString(header, '0', 156, 1); // regular file
  writeString(header, 'ustar\0' + '00', 257, 8);

  // The checksum is calculated with the checksum field itself filled with spaces.
  writeString(header, ' '.repeat(8), 148, 8);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  writeString(header, checksum.toString(8).padStart(6, '0') + '\0 ', 148, 8);

  return header;
}

export async function createTarGz(files: { name: string; content: string }[]): Promise<Uint8Array<ArrayBuffer>> {
  const now = new Date();
  const blocks: Uint8Array[] = [];

  for (const file of files) {
    const content = new TextEncoder().encode(file.content);
    blocks.push(createHeader(file.name, content.length, now));
    blocks.push(content);

    const padding = (BLOCK_SIZE - (content.length % BLOCK_SIZE)) % BLOCK_SIZE;
    blocks.push(new Uint8Array(padding));
  }

  // The archive ends with two empty blocks.
  blocks.push(new Uint8Array(BLOCK_SIZE * 2));

  const tar = new Uint8Array(blocks.reduce((sum, block) => sum + block.length, 0));
  let offset = 0;
  for (const block of blocks) {
    tar.set(block, offset);
    offset += block.length;
  }

  return transform(tar, new CompressionStream('gzip'));
}

export async function extractTarGz(data: ArrayBuffer): Promise<{ name: string; content: string }[]> {
  const tar = await transform(new Uint8Array(data), new DecompressionStream('gzip'));
  const decoder = new TextDecoder();
  const files: { name: string; content: string }[] = [];

  let offset = 0;
  while (offset + BLOCK_SIZE <= tar.length) {
    const header = tar.subarray(offset, offset + BLOCK_SIZE);
    // An empty block marks the end of the archive.
    if (header[0] === 0) {
      break;
    }

    const name = decoder.decode(header.subarray(0, 100)).replace(/\0.*$/s, '');
    const size = parseInt(decoder.decode(header.subarray(124, 136)).replace(/\0.*$/s, '').trim() || '0', 8);
    const type = String.fromCharCode(header[156]);

    offset += BLOCK_SIZE;

    // Only regular files are relevant.
    if (type === '0' || type === '\0') {
      files.push({ name, content: decoder.decode(tar.subarray(offset, offset + size)) });
    }

    offset += Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
  }

  return files;
}
