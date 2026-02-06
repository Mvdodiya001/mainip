import React, { useEffect, useState } from "react";
import "./../Styles/tabs.css";

export default function Tabs(props) {
  const {handleOutputConsole:setTabs, dashboardData:tabs,handleTabClose, index:activeTabIndex, handleIndex}=props; 
  const setActiveTab = (index) => {
    handleIndex(index);
  };
  const removeTab = (key) => {
    const updatedTabs = { ...tabs };
    const removedData = updatedTabs[key];
    const { username, topic, ipAddress } = removedData;
    handleTabClose({ username, topic, ip:ipAddress })
    delete updatedTabs[key];
    setTabs(updatedTabs);
    const remainingKeys = Object.keys(updatedTabs);
    setActiveTab(remainingKeys.length ? remainingKeys[0] : null);
  };
  // useEffect(() => {
  //   return () => {
  //     // This code will run when the component is unmounted
  //     // Call handleTabClose for all tabs
  //     Object.values(tabs).forEach((tabData) => {
  //       const { username, topic, ipAddress } = tabData;
  //       handleTabClose({ username, topic,ip: ipAddress });
  //     });
  //   };
  // }, [tabs, handleTabClose]);
  if(activeTabIndex===null) return (null);
  return (
    <>
    <h4 className="text-center">Output Console</h4>
    <div className="tabs-container">
      <div className="tabs">
        
        <ul className="tab-header">
          {Object.keys(tabs).map((key) => (
            <li
              key={key}
              className={activeTabIndex === key ? "active-tab" : ""}
              onClick={() => setActiveTab(key)}
            >
              {key}
            </li>
          ))}
          <span className="add-remove-icons">
            {/* <span className="add-tab-icon" >
              + Add
            </span> */}
            {activeTabIndex !== null && (
              <span className="remove-tab-icon" onClick={() => removeTab(activeTabIndex)}>
                &times; Remove
              </span>
            )}
          </span>
        </ul>
        <div className="tab-body">
          {Object.keys(tabs).map((key) => {
            return (
            <div
              className="tab"
              key={key}
              style={{ display: activeTabIndex === key ? "block" : "none" }}
            >
              <div className="row">
                <span className="col">User: {tabs[key].username}</span>
                <span className="col">Topic: {tabs[key].topic}</span>
                <span className="col">ip: {tabs[key].ipAddress}</span>
              </div>
              <hr />
              {tabs[key].dashboardData.split("\n").map((line, index) => {   
                if(line.trim()==='') return;
                return (
                <div key={index}>{line}</div>
              )})}
            </div>
          )})}
        </div>
      </div>
    </div>
    </>
  );
}
