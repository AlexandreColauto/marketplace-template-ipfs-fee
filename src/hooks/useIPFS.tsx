import multihash from "multihashes";
import { useMoralisFile } from "react-moralis";
import { CID } from "multiformats/cid";
import { base58btc } from "multiformats/bases/base58";

function useIPFS() {
  const { saveFile } = useMoralisFile();

  const uploadMoralis = async (metadata: any) => {
    const base64 = Buffer.from(JSON.stringify(metadata)).toString("base64");
    const _file: any = await saveFile(
      metadata.name,
      { base64 },
      {
        saveIPFS: true,
      }
    );
    if (!_file) return;
    const cid = _file.hash();
    if (!cid) return;

    const v1 = CID.parse(cid, base58btc.decoder).toV1();
    const bytes = v1.multihash.bytes;
    const encoded = multihash.toHexString(bytes);
    const shorter = "0x" + encoded.slice(4);

    return shorter;
  };
  return uploadMoralis;
}

export default useIPFS;
