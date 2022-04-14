import { useMoralis } from "react-moralis";
import useIPFS from "./useIPFS";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";

type uploadFile = (e: File) => Promise<string>;
interface props {
  name: string;
  description?: string;
  imgUrl?: string | null;
  callback: () => void;
  address: string;
  collectionName: string;
}
type create = (props: props) => Promise<boolean | undefined>;
function useCreateCollection(): [uploadFile, create] {
  const { isAuthenticated, Moralis, authenticate } = useMoralis();
  const upload = useIPFS();
  const mint: create = async (props) => {
    const ethers = Moralis.web3Library;

    const { name, description, imgUrl, callback, address, collectionName } =
      props;
    if (!name || !imgUrl) {
      //alert("Fill the required Information before minting.");
      //return false;
    }
    if (!isAuthenticated) authenticate();

    const currentId = {
      contractAddress: address,
      functionName: "getFee",
      abi: NFT.abi,
    };
    const _fee = await Moralis.executeFunction(currentId);

    const data = JSON.stringify({
      name,
      description,
      image: imgUrl,
      fee: _fee.toString(),
    });
    const token_id_hash = await upload(data);
    const token_id_bigNumber = ethers.BigNumber.from(token_id_hash.toString());
    const mint = {
      contractAddress: address,
      functionName: "mint",
      abi: NFT.abi,
      params: {
        reciever: Moralis.account,
        id: token_id_bigNumber,
      },
    };
    try {
      const tokenHash: any = await Moralis.executeFunction(mint);

      await tokenHash.wait();
      callback();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const saveFile: uploadFile = async (e) => {
    console.log("uploading file");
    const data = e;
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();
    return file._url;
  };

  return [saveFile, mint];
}
export default useCreateCollection;
