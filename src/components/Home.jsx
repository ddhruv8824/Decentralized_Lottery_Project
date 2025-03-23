import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractAddress, contractAbi } from "../constants";
import { Layout, Card, Button, Typography, Space, message } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import MetaMaskSDK from "@metamask/sdk";
import "./Home.css";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [status, setStatus] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeMetaMask = async () => {
      try {
        setLoading(true);
        
        // Check if window.ethereum exists first (MetaMask injected provider)
        if (!window.ethereum) {
          message.error("Please install MetaMask extension");
          return;
        }

        // Initialize MetaMask SDK
        const MMSDK = new MetaMaskSDK({
          dappMetadata: { 
            name: "Lottery DApp",
            url: window.location.href 
          },
          useDeeplink: false, // Prevent mobile deeplink attempts for now
          logging: {
            sdk: true, // Enable debug logs
          },
          checkInstallationImmediately: false, // Let us handle detection
        });

        // Explicitly wait for SDK initialization
        await MMSDK.init();
        const ethereum = MMSDK.getProvider() || window.ethereum;

        if (!ethereum) {
          message.error("Unable to connect to MetaMask. Please ensure it's installed and unlocked.");
          return;
        }

        // Request account access
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        }).catch(err => {
          if (err.code === 4001) {
            message.error("User rejected the connection request");
          } else {
            message.error("Error connecting to MetaMask: " + err.message);
          }
          throw err;
        });

        if (!accounts || accounts.length === 0) return;

        const address = accounts[0];
        setCurrentAccount(address);

        ethereum.on("accountsChanged", (newAccounts) => {
          setCurrentAccount(newAccounts.length ? newAccounts[0] : "");
        });

        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const contractIns = new ethers.Contract(contractAddress, contractAbi, signer);
        
        setContractInstance(contractIns);

        const status = await contractIns.isComplete();
        setStatus(status);

        const winner = await contractIns.getWinner();
        setIsWinner(winner === address);

      } catch (err) {
        console.error("Blockchain initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeMetaMask();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const enterLottery = async () => {
    if (!contractInstance) return;
    try {
      const amountToSend = ethers.parseEther("0.001");
      const tx = await contractInstance.enter({ value: amountToSend });
      await tx.wait();
      message.success("Successfully entered the lottery!");
    } catch (error) {
      message.error("Transaction failed: " + error.message);
    }
  };

  const claimPrize = async () => {
    if (!contractInstance) return;
    try {
      const tx = await contractInstance.claimPrize();
      await tx.wait();
      message.success("Prize claimed successfully!");
    } catch (error) {
      message.error("Claim failed: " + error.message);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#121212", color: "#fff" }}>
      <Header style={{ background: "#1e1e1e", color: "white", textAlign: "center", fontSize: "22px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        Lottery DApp
      </Header>
      <Content style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0px" }} className="content-box">
        <img src="https://imgs.search.brave.com/gnZT3PYtJNBZPjymFi2-TysHx4lSwEHclB2ySaRSB6U/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9mcmVl/bG9nb3BuZy5jb20v/aW1hZ2VzL2FsbF9p/bWcvMTY4MzAyMDk1/NW1ldGFtYXNrLWlj/b24tcG5nLnBuZw" alt="MetaMask Logo" style={{ width: "300px" }} />
        <Card style={{ width: 400, textAlign: "center", background: "#1e1e1e", color: "#fff", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.4)", border: "1px solid #333" }}>
          <Title level={3} style={{ color: "#fff" }}>Lottery Page</Title>
          <Text strong style={{ color: "#bbb" }}>Connected Account:</Text>
          <Text style={{ display: "block", marginBottom: 20, color: currentAccount ? "#fff" : "#ff4d4f" }}>
            {loading ? "Connecting..." : (currentAccount || "Not connected")}
          </Text>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {loading ? (
              <Text style={{ color: "#fff" }}>Loading...</Text>
            ) : status ? (
              isWinner ? (
                <Button type="primary" size="large" onClick={claimPrize} icon={<WalletOutlined />} style={{ backgroundColor: "#4caf50", borderColor: "#4caf50" }}>
                  Claim Prize
                </Button>
              ) : (
                <Text type="danger" style={{ color: "#ff4d4f" }}>You are not the Winner</Text>
              )
            ) : (
              <Button type="primary" size="large" onClick={enterLottery} icon={<WalletOutlined />} style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}>
                Enter Lottery
              </Button>
            )}
          </Space>
        </Card>
        <img src="https://imgs.search.brave.com/tv8cowhAjrhvABy3CEE_TIZmarj5CHBbm_IahmAmlEM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYWxsLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMTAvRXRo/ZXJldW0tTG9nby1Q/TkctUGljLnBuZw" alt="Ethereum Logo" style={{ width: "300px" }} />
      </Content>
    </Layout>
  );
}

export default Home;