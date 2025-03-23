import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractAbi } from "../constants";

function PickWinner() {
  const [owner, setOwner] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [isOwnerConnected, setIsOwnerConnected] = useState(false);
  const [winner, setWinner] = useState("");
  const [status, setStatus] = useState(false);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        try {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setCurrentAccount(address);

          window.ethereum.on("accountsChanged", (accounts) => {
            setCurrentAccount(accounts[0]);
          });
        } catch (err) {
          console.error(err);
        }
      } else {
        alert("Please install MetaMask to use this application");
      }
    };

    const loadContract = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractIns = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );
        setContractInstance(contractIns);

        const status = await contractIns.isComplete();
        setStatus(status);
        const winner = await contractIns.getWinner();
        setWinner(winner);
        const owner = await contractIns.getManager();
        setOwner(owner);
        setIsOwnerConnected(owner === currentAccount);
      }
    };

    loadBlockchainData();
    loadContract();
  }, [currentAccount]);

  const pickWinner = async () => {
    if (!contractInstance) {
      console.error("Contract instance is not initialized yet.");
      return;
    }
    const tx = await contractInstance.pickWinner();
    await tx.wait();
  };

  return (
    <div className="container">
      <h1>Result Page</h1>
      <div className="button-container">
        {status ? (
          <p>Lottery Winner is: {winner}</p>
        ) : isOwnerConnected ? (
          <button className="enter-button" onClick={pickWinner}>
            Pick Winner
          </button>
        ) : (
          <p>You are not the owner</p>
        )}
      </div>
    </div>
  );
}

export default PickWinner;
