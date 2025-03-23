import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import { HomeOutlined, TrophyOutlined } from "@ant-design/icons";
import Home from "./components/Home";
import PickWinner from "./components/PickWinner";
import "./App.css"

const { Header, Content } = Layout;

function App() {
  return (
    <div className="border">
      <BrowserRouter>
        <Layout style={{ minHeight: "100vh" }}>
          {/* Navbar */}
          <Header style={{ background: "#000" }}>
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={["1"]}
              style={{ background: "black", color: "white" }}
            >
              <Menu.Item key="1" icon={<HomeOutlined />}>
                <Link to="/" style={{ color: "white" }}>
                  Home
                </Link>
              </Menu.Item>
              <Menu.Item key="2" icon={<TrophyOutlined />}>
                <Link to="/PickWinner" style={{ color: "white" }}>
                  Pick Winner
                </Link>
              </Menu.Item>
            </Menu>
          </Header>

          {/* Page Content */}
          <Content style={{ padding: "20px" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/PickWinner" element={<PickWinner />} />
            </Routes>
          </Content>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
