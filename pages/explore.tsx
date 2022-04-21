import React, { useEffect, useState } from "react";
import useFetchMarket from "../src/hooks/useFetchMarket";
import { useMoralis } from "react-moralis";
import Moralis from "moralis/types";
import useFetchCollection from "../src/hooks/useFetchCollection";
import useBuyNFT from "../src/hooks/useBuyNFT";
import NFTTile from "../src/components/NFTTile";
import { useQuery } from "react-query";
import Link from "next/link";
import ToastSucess from "../src/components/ToastSucess";
import ToastError from "../src/components/ToastError";
import Processing from "../src/components/Processing";
import customCollections from "../customCollections.json";

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

function Explore() {
  const [fetchItems, filterItems] = useFetchMarket();
  const { isWeb3Enabled } = useMoralis();
  const [collectionList, setCollectionList] = useState<
    Moralis.Object<Moralis.Attributes>[]
  >([]);
  const [filteredcollectionList, setfilteredcollectionList] = useState<
    Moralis.Object<Moralis.Attributes>[]
  >([]);
  const [, fetchAll] = useFetchCollection();
  const [marketItms, setMarketItms] = useState<marketItms[]>();
  const [metadata, setMetadata] = useState<metadata[]>();
  const [filtered_metadata, setfiltered_Metadata] = useState<metadata[]>();
  const [empty, setEmpty] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setisError] = useState(false);
  const [processing, setProcessing] = useState(false);

  const buy = useBuyNFT();
  const { isLoading } = useQuery("collection", {
    enabled: isWeb3Enabled,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    getItems();
  }, [isWeb3Enabled]);

  useEffect(() => {
    getCollections();
  }, [isLoading]);

  useEffect(() => {
    if (!marketItms || !collectionList) return;
    filterCollections(marketItms);
  }, [marketItms, collectionList]);

  const getCollections = async () => {
    if (!isWeb3Enabled) return;
    const [_collections] = await fetchAll();
    if (!_collections) return;
    console.log(_collections);
    setCollectionList(_collections);
  };

  async function picklistChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const collectionName = e.target.value;
    if (collectionName === "All Collections") {
      setfiltered_Metadata(metadata);
      return;
    }
    if (!marketItms || !metadata) return;
    const [_marketItms, _metadata] = filterItems(
      collectionName,
      marketItms,
      metadata
    );
    setfiltered_Metadata(_metadata);
  }
  const getItems = async () => {
    if (!isWeb3Enabled) return;
    const answer = await fetchItems();

    if (!answer) return;
    setEmpty(!answer[0].length);
    const [_marketItms, _metadata] = answer;
    setMarketItms(_marketItms);
    setMetadata(_metadata);
    setfiltered_Metadata(_metadata);
    filterCollections(_marketItms);
  };
  async function handleBuy(nftToBuy: metadata) {
    setProcessing(true);
    const callback = () => {
      setProcessing(false);
      setIsSuccess(true);
    };
    const errCallback = () => {
      setProcessing(false);
      setisError(true);
    };
    await buy({ ...nftToBuy, callback, errCallback });
  }
  const filterCollections = (marketItms: marketItms[]) => {
    const filteredCollections: any[] = [];
    if (!marketItms) return;
    collectionList.map((collection, i) => {
      const collectionsItems = marketItms.filter((item) => {
        return (
          item.collectionAddress === collection.attributes.collectionAddress
        );
      });
      if (collectionsItems.length) filteredCollections.push(collection);
    });
    setfilteredcollectionList(filteredCollections);
  };

  return (
    <div className="pb-16">
      <p className="text-6xl text-[#E8C39C] font-bold text-center py-14">
        Explore Collections
      </p>
      <div className="flex mt-4 bg-black w-8/12 mb-8 mx-auto border border-secondary rounded overflow-hidden">
        <span className="text-sm text-white  px-4 py-2 bg-secondary whitespace-no-wrap">
          Collection:
        </span>
        <select
          className=" py-2 w-full  bg-white"
          onChange={(e) => {
            picklistChange(e);
          }}
        >
          <option>All Collections</option>
          {customCollections &&
            customCollections.map((collection, index: any) => (
              <option value={collection.address}>{collection.name}</option>
            ))}
          {filteredcollectionList.map((collection, i) => (
            <option key={i} value={collection.get("collectionAddress")}>
              {collection.get("name")}
            </option>
          ))}
        </select>
      </div>
      <hr />
      {empty ? (
        <div className="flex mx-auto justify-content-center mt-8">
          <div className="mx-auto text-center">
            <p className="text-4xl font-bold text-white">
              {" "}
              There&apos;s currently no NFT on the Marketplace, come back later.
            </p>
          </div>
        </div>
      ) : (
        <div className="md:flex justify-center">
          <div className="px-4" style={{ maxWidth: "1600px" }}>
            <div className="grid grid-cols-1 text-[#E8C39C] sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {filtered_metadata &&
                filtered_metadata.map((nft, i) => (
                  <NFTTile
                    key={i}
                    nft={nft}
                    callback={handleBuy}
                    button="Buy"
                  />
                ))}
            </div>
          </div>
        </div>
      )}
      <Processing isOpen={processing} />

      {isSuccess && <ToastSucess isOpen={true} toggle={setIsSuccess} />}
      {isError && <ToastError isOpen={true} toggle={setisError} />}
    </div>
  );
}

export default Explore;
