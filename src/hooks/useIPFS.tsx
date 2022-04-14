import multihash from "multihashes";
import { create } from "ipfs-core";

function useIPFS() {
  const upload = async (metadata: any) => {
    const ipfs = await create({ repo: "metadata" });
    const cid = await ipfs.add(metadata, {
      cidVersion: 1,
      hashAlg: "sha2-256",
    });
    const bytes = cid.cid.bytes;
    const encoded = multihash.toHexString(bytes);
    const shorter = "0x" + encoded.slice(8);

    return shorter;
  };
  return upload;
}

export default useIPFS;
