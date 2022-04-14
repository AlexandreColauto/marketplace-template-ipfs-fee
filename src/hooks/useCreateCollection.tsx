import { useMoralis } from "react-moralis";
import axios from "axios";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";

type uploadFile = (e: File) => Promise<string>;
interface props {
  name: string;
  description?: string;
  imgUrl?: string | null;
  fee?: string | null;
  callback: () => void;
}
type create = (props: props) => Promise<boolean>;
function useCreateCollection(): [uploadFile, create] {
  const { isAuthenticated, Moralis } = useMoralis();
  const marketAddress = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;

  const create: create = async (props) => {
    const ethers = Moralis.web3Library;

    const { name, description, imgUrl, fee, callback } = props;

    if (!name) {
      alert("Give a name to your collection!");
      return false;
    }
    try {
      const web3Provider = await Moralis.enableWeb3();
      const signer = await web3Provider.getSigner();
      const address = await Moralis.account;

      console.log(signer);
      const tokenContract = new ethers.ContractFactory(
        NFT.abi,
        NFT.bytecode,
        signer
      );
      console.log(marketAddress);
      console.log(fee);
      console.log(address);
      const nft = await tokenContract.deploy(marketAddress, fee, address);
      await nft.deployed();
      console.log("nft deployed to:", nft.address);

      const Collection = Moralis.Object.extend({
        className: "collection",
      });
      const collection = new Collection();
      collection.save({
        name: name,
        collectionAddress: nft.address,
        owner: address,
        imgUrl: imgUrl,
        description: description,
      });

      callback();
      return true;
    } catch (error: any) {
      console.log(error);
      return false;
    }
  };

  const saveFile: uploadFile = async (e) => {
    const data = e;
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();
    return file._url;
  };

  return [saveFile, create];
}
export default useCreateCollection;
