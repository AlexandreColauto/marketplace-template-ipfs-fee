import { useMoralis } from "react-moralis";
import NFTMarket from "../../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../../artifacts/contracts/NFT.sol/NFT.json";
import axios from "axios";

interface marketItms {
  collectionAddress: string;
  itemId: string;
  nftAddress: string;
  owner: string;
  price: string;
  sold: boolean;
  tokenId: string;
}

interface metadata {
  description: string;
  id: string;
  image: string;
  marketId?: number;
  name: string;
  price?: string;
  address: string;
}

type fetchItems = (
  collectionAddress?: string | undefined
) => Promise<[marketItms[], metadata[]] | undefined>;

type filterNFTs = (
  collectionAddr: string,
  collections: marketItms[],
  metadata: metadata[]
) => [marketItms[], metadata[]];

interface dictionary {
  [key: string]: string;
}

const useFetchMarket = (): [fetchItems, filterNFTs] => {
  const { Moralis, isWeb3Enabled, isWeb3EnableLoading, web3 } = useMoralis();

  const fetchItems = async (): Promise<
    [marketItms[], metadata[]] | undefined
  > => {
    if (!isWeb3Enabled) return;
    const marketAddress = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;
    const userAddress = await Moralis.account;
    if (!marketAddress || !userAddress) return;

    const fetchItems = {
      contractAddress: marketAddress,
      functionName: "fetchAllCollection",
      abi: NFTMarket.abi,
    };
    try {
      const marketItms: any = await Moralis.executeFunction(fetchItems);
      const collectionsURI = await getCollectionURI(marketItms);
      const nftsMeta = await setNFTMetadata(marketItms, collectionsURI);
      return [marketItms, nftsMeta];
    } catch (err) {
      console.log(err);
      return;
    }
  };

  async function setNFTMetadata(
    nftsMeta: marketItms[],
    collectionsURI: dictionary
  ) {
    return await Promise.all(
      nftsMeta.map(async (nft) => {
        const uri = collectionsURI[nft.collectionAddress];
        console.log(uri);
        try {
          const _metadata = await axios.get(uri);
          const metadata: metadata = _metadata.data;
          metadata.id = nft.tokenId;
          metadata.price = Moralis.Units.FromWei(nft.price);
          metadata.marketId = parseInt(nft.itemId);
          metadata.address = nft.collectionAddress;
          return metadata;
        } catch (error: any) {
          console.log(error.message);
          const dataPlaceHolder = {
            address: nft.collectionAddress,
            id: nft.tokenId,
            description: "Not Available",
            image: "/logo.png",
            name: "Not Available",
          };
          return dataPlaceHolder;
        }
      })
    );
  }

  const getCollectionURI = async (marketItms: marketItms[]) => {
    const CollectionURIDictionary: dictionary = {};
    await Promise.all(
      marketItms.map(async (item) => {
        if (!CollectionURIDictionary[item.collectionAddress]) {
          const ethers = Moralis.web3Library;
          if (!web3) return;
          const nftContract = new ethers.Contract(
            item.collectionAddress,
            NFT.abi,
            web3
          );
          const uri = await nftContract.uri(item.tokenId);
          CollectionURIDictionary[item.collectionAddress] = uri;
        }
      })
    );
    return CollectionURIDictionary;
  };

  const filterNFTs: filterNFTs = (
    collectionAddr: string,
    collections: marketItms[],
    metadata: metadata[]
  ) => {
    const _collections = collections.filter((item) => {
      return item.collectionAddress === collectionAddr;
    });
    const _metadata = metadata.filter((item) => {
      return item.address === collectionAddr;
    });
    return [_collections, _metadata];
  };
  return [fetchItems, filterNFTs];
};

export default useFetchMarket;
