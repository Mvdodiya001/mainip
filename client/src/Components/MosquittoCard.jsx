import React from "react";
import Tabs from "./Tabs";
export default function MosquittoCard(props) {
  const { dashboardData, setFormData, formData, type, handleClick,handleOutputConsole,handleTabClose, index, handleIndex} = props;
  const handleChangeValues = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <>
      <div className="custom-container">
        <h2>{type === "subs" ? "Subscribe" : "Publish"}</h2>
        <div className="input-div col">
          <div className="row m-2">
            <label>Username: </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              className="inputbox"
              onChange={(e) => handleChangeValues(e)}
              placeholder="Username"
              required
            />
          </div>
          <div className="row m-2">
            <label>Password: </label>
            <input
              type="text"
              name="password"
              value={formData.password}
              className="inputbox"
              onChange={(e) => handleChangeValues(e)}
              placeholder="Password"
              required
            />
          </div>
          <div className="row m-2">
            <label>Topic: </label>
            <input
              type="text"
              name="topic"
              placeholder="Topic"
              value={formData.topic}
              className="inputbox"
              onChange={(e) => handleChangeValues(e)}
              required
            />
          </div>
          <div className="row m-2">
            <label>IP Address: </label>
            <input
              type="text"
              placeholder="IP Address"
              name="ip"
              className="inputbox"
              value={formData.ip}
              onChange={(e) => handleChangeValues(e)}
              required
            />
          </div>
          {type === "pubs" && (
            <div className="row m-2">
              <label>Message: </label>
              <input
                type="text"
                name="message"
                className="inputbox"
                value={formData.message}
                onChange={(e) => handleChangeValues(e)}
                placeholder="message"
                required
              />
            </div>
          )}
          <div className="form-footer">
            <button className="button-26" onClick={handleClick}>
              {type === "subs" ? "Subscribe" : "Publish"}
            </button>
            <button
              className="button-39"
              onClick={() => {
                setFormData((prv=>{
                  let temp={}
                  for(let key in prv){
                    temp[key]=""
                  }
                  return temp
                }));
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      <Tabs dashboardData={dashboardData} handleOutputConsole={handleOutputConsole} handleTabClose={handleTabClose} index={index} handleIndex={handleIndex}></Tabs>
    </>
  );
}
