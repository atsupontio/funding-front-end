import React from "react";
import "./Vote.css";
import golf from "../images/golf.png";
import canoe from "../images/canoe.png";
import abi  from "../constants/voterABI.json";
import { defaultImgs } from "../defaultimgs";
import { Icon, TextArea } from "web3uikit";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { useEffect, useState } from "react";

const Vote = ({ profile }) => {

  const [tweetArr, setTweetArr] = useState();
  const { Moralis, account } = useMoralis();
  const contractProcessor = useWeb3ExecuteFunction();


  const [ideaId, setId] = useState();
  const [reason, setReason] = useState();

  // async function addLike() {
  //   const Ideas = Moralis.Object.extend("Ideas");

  //   const query = new Moralis.Query(Ideas);
  //   const results = await query.find();

  //   results.likeNumber += 1;

  //   window.location.reload();

  //   console.log("clicked");

  // }

  useEffect(() => {
    async function getTweets() {
      try {
        const Ideas = Moralis.Object.extend("Ideas");
        const query = new Moralis.Query(Ideas);
        // const CID = query.increment("CID");

        if (profile) {
          query.equalTo("tweeterAcc", account);
        }
        const results = await query.find();

        setTweetArr(results);
        console.log(results);

      } catch (error) {
        console.log(error);
        console.log(error.data);
        console.log(error.data.message);
      }
    }
    getTweets();
  }, [profile]);


  async function test() {
    console.log("running!");
  }

  async function vote() {

    if(!ideaId || !reason) return;

    console.log(ideaId);
    console.log(reason);

    await contractProcessor.fetch({
      params: {
        contractAddress: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
        functionName: "voteWithReason",
        abi: abi,
        params: {
          ideaId: ideaId,
          reason: reason,
        },
        // msgValue: Moralis.Units.ETH(1),
      },
      onSuccess: () => {
        console.log("voteWithReason is executed!");
      },
      onError: (error) => {
        console.log("voteWithReason is not executed!");
        console.log(error);
        console.log(error.data);
        console.log(error.data.message);
      }
    });

    let num = await getNum();

    const Ideas = Moralis.Object.extend("Ideas");
    const query = new Moralis.Query(Ideas);
    query.equalTo("ideaID", ideaId);
    //await target.set("votedNumber", num);
    const db = await query.first();

    db.set("votedNumber", num);
    db.save();
    // const ans = await query.find();
    console.log(db);

    // window.location.reload();
  }

  async function getNum() {

    let num = await contractProcessor.fetch({
      params: {
        contractAddress: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
        functionName: "getVotedNumber",
        abi: abi,
        params: {ideaId: ideaId},
        // msgValue: Moralis.Units.ETH(1),
      },
      onSuccess: () => {
        console.log("getNum is executed!");
      },
      onError: (error) => {
        console.log("not executed!");
        console.log(error);
        console.log(error.data);
        console.log(error.data.message);
      }
    });

    console.log(Number(num));

    return Number(num);

  }


  return (
    <>
    <div className="pageIdentify">VOTE</div>
    <>
      <div className="mainContent">
        <div className="profileTweet">
          <div className="tweetBox">
            <TextArea
              label="Id"
              name="Id"
              value=""
              placeholder="Type here field"
              type="number"
              onChange={(e) => setId(e.target.value)}
              width="95%"
            ></TextArea>
            <TextArea
              label="reason"
              name="reason"
              value=""
              placeholder="Type here field"
              type="text"
              onChange={(e) => setReason(e.target.value)}
              width="95%"
            ></TextArea>

            <div className="imgOrTweet">
              <div className="voteOptions">
                <div className="vote" onClick={vote}>VOTE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
      {tweetArr?.map((e) => {
        return (
          <>
            <div className="feedTweet">
              <img src={e.attributes.tweeterPfp ? e.attributes.tweeterPfp : defaultImgs[0]} className="profilePic"></img>
              <div className="completeTweet">
                <div className="who">
                {e.attributes.tweeterUserName.slice(0, 6)}
                  <div className="accWhen">{
                        `${e.attributes.tweeterAcc.slice(0, 4)}...${e.attributes.tweeterAcc.slice(38)} · 
                        ${e.attributes.createdAt.toLocaleString('en-us', { month: 'short' })}  
                        ${e.attributes.createdAt.toLocaleString('en-us', { day: 'numeric' })}
                        `  
                      }
                      </div>
                </div>
                
                <div className="tweetContent">
                idea ID: {e.attributes.ideaID}
                </div>
                <div className="tweetContent">
                explanation: {e.attributes.explanationTxt}
                </div>
                <div className="tweetContent">
                target money: {e.attributes.targetMoneyTxt}
                </div>
                <div className="tweetContent">
                voted number: {e.attributes.votedNumber}
                </div>
                <div className="tweetContent">
                submission time: {e.attributes.submissionTime}
                </div>
                <div className="tweetContent">
                time limit: {e.attributes.timeLimit}
                </div>
                <div className="tweetContent">
                investment form: {e.attributes.investmentFormTxt}
                </div>
                <div className="tweetContent">
                voter can vote: {e.attributes.voterCanVote}
                </div>
                <div className="tweetContent">
                vote result: {e.attributes.voteResult}
                {e.attributes.tweetImg && (
                        <img
                          src={e.attributes.tweetImg}
                          className="tweetImg"
                        ></img>
                      )}
                </div>
                <div className="interactions">
                  <div className="interactionNums">
                    <Icon fill="#3f3f3f" size={20} svg="messageCircle" />
                  </div>
                  <div className="interactionNums" >
                    <Icon fill="#3f3f3f" size={20} svg="star" />
                  </div>
                  <div className="interactionNums">
                    <Icon fill="#3f3f3f" size={20} svg="matic" />
                  </div>
                  <div className="voteOptions">
                    <div className="vote" onClick={vote}>VOTE</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      }).reverse()}
    </>
  );
};

export default Vote;
