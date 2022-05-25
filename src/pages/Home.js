import React from "react";
import "./Home.css";
import abi  from "../constants/drafterABI.json";
import { defaultImgs } from "../defaultimgs";
import { TextArea, Icon, Form } from "web3uikit";
import { useState, useRef } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";

const Home = () => {

  const { Moralis } = useMoralis();
  const user = Moralis.User.current();
  const contractProcessor = useWeb3ExecuteFunction();

  const inputFile = useRef(null);
  const [selectedFile, setSelectedFile] = useState();
  const [theFile, setTheFile] = useState();
  const [explanation, setExplanation] = useState();
  const [targetMoney, setTargetMoney] = useState();
  const [investmentForm, setInvestmentForm] = useState();
  const [likeNumber, setLikeNumber] = useState();
  const [state, setState] = useState();

  const [CID, setCID] = useState();
  // setCID(0);

  async function maticTweet() {

    if (!explanation) return;

    let img;
    if (theFile) {
      const data = theFile;
      const file = new Moralis.File(data.name, data);
      await file.saveIPFS();
      img = file.ipfs();
    }else{
      img = "No Img"
    }    

    let options = {
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      functionName: "postIdea",
      abi: abi,
      params: {
        _explanation: explanation,
        _timeLimit: 30,
        _targetMoney: 0,
        _investmentForm: investmentForm
      },
      // msgValue: Moralis.Units.ETH(1),
    }

    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        console.log("postIdea is executed!");
        saveTweet();
      },
      onError: (error) => {
        console.log("not executed!");
        console.log(error);
        console.log(error.data);
        console.log(error.data.message);
      }
    });
  }

  async function saveTweet() {

    if(!explanation || !targetMoney || !investmentForm) return;

    const Ideas = Moralis.Object.extend("Ideas");

    const newIdea = new Ideas();

    const id = await setId();


    let _state = await contractProcessor.fetch({
      params: {
        contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        functionName: "viewIdea",
        abi: abi,
        params: {_ideaId: id},
        // msgValue: Moralis.Units.ETH(1),
      },
      onSuccess: () => {
        console.log("viewIdea is executed!");
      },
      onError: (error) => {
        console.log("not executed!");
        console.log(error);
        console.log(error.data);
        console.log(error.data.message);
      }
    });

    console.log(_state);

    newIdea.set("ideaID", String(_state[0]));
    newIdea.set("explanationTxt", explanation);
    newIdea.set("targetMoneyTxt", targetMoney);
    newIdea.set("investmentFormTxt", investmentForm);
    newIdea.set("votedNumber", Number(_state[2]));
    newIdea.set("submissionTime", String(_state[5]));   
    newIdea.set("timeLimit", String(_state[6]));
    newIdea.set("voterCanVote", String(_state[9]));
    newIdea.set("voteResult", String(_state[10]));
    newIdea.set("tweeterPfp", user.attributes.pfp);
    newIdea.set("tweeterAcc", user.attributes.ethAddress);
    newIdea.set("tweeterUserName", user.attributes.username);

    console.log("idea is stored");

    if (theFile) {
      const data = theFile;
      const file = new Moralis.File(data.name, data);
      await file.saveIPFS();
      newIdea.set("tweetImg", file.ipfs());
    }

    await newIdea.save();

    window.location.reload();

  }

  async function test() {
    console.log("running!");
  }

  const onImageClick = () => {
    inputFile.current.click();
  };

  const changeHandler = (event) => {
    const img = event.target.files[0];
    setTheFile(img);
    setSelectedFile(URL.createObjectURL(img));
  };

  async function setId() {

    let ID = await contractProcessor.fetch({
      params: {
        contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        functionName: "getId",
        abi: abi,
        params: {},
        // msgValue: Moralis.Units.ETH(1),
      },
      onSuccess: () => {
        console.log("getId is executed!");
      },
      onError: (error) => {
        console.log("not executed!");
        console.log(error);
        console.log(error.data);
        console.log(error.data.message);
      }
    });

    ID -= 1;

    console.log(String(ID));

    return String(ID);

  }

  return (
    <>
      <div className="mainContent">
        <div className="profileTweet">
          <img src={user.attributes.pfp ? user.attributes.pfp : defaultImgs[0]} className="profilePic"></img>
          <div className="tweetBox">
            <TextArea
              label="explanation"
              name="explanation"
              value=""
              placeholder="Type here field"
              type="text"
              onChange={(e) => setExplanation(e.target.value)}
              width="95%"
            ></TextArea>
            <TextArea
              label="target money"
              name="target money"
              value=""
              placeholder="Type here field"
              type="text"
              onChange={(e) => setTargetMoney(e.target.value)}
              width="95%"
            ></TextArea>
            <TextArea
              label="form of investment"
              name="form of investment"
              value=""
              placeholder="Type here field"
              type="text"
              onChange={(e) => setInvestmentForm(e.target.value)}
              width="95%"
            ></TextArea>



            {selectedFile && (
              <img src={selectedFile} className="tweetImg"></img>
            )}
            <div className="imgOrTweet">
              <div className="imgDiv" onClick={onImageClick}>
              <input
                  type="file"
                  name="file"
                  ref={inputFile}
                  onChange={changeHandler}
                  style={{ display: "none"}}
                />
                <Icon fill="#1DA1F2" size={20} svg="image"></Icon>
              </div>
              <div className="tweetOptions">
                <div className="tweet" onClick={saveTweet}>POST</div>
                <div className="tweet" onClick={() => {
                  // getId();
                  maticTweet();
                }} style={{ backgroundColor: "#8247e5" }}>
                  <Icon fill="#ffffff" size={20} svg="matic" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
