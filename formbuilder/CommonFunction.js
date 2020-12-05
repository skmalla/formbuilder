import React, { Component } from "react";
import {
  Label,
  Input,
  Button,
  Alert,
  Card,
  CardHeader,
  CardBody,
  UncontrolledCollapse,
} from "reactstrap";
import { asyncContainer, Typeahead } from "react-bootstrap-typeahead";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faChevronUp,
  faChevronDown,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Overlay from "react-bootstrap/Overlay";
import Popover from "react-bootstrap/Popover";
import "./CommonFunction.css";

const AsyncTypeahead = asyncContainer(Typeahead);
var isLoading = false;
var urlTypeAhead = localStorage.getItem("apiURL");

export async function fieldEdited(e, fields, values) {
  try {
    //console.log(new Date('2020-9-10'))
    //console.log(this.fileUploadArray);
    //console.log(this.fileUploadArray[0]);
    var id = e.target.getAttribute("id");
    var fileUploadCall = false;
    if (e.target.getAttribute("type") == "file") {
      fileUploadCall = true;
      var fileIndex = e.target.getAttribute("index");
      var formData = new FormData();
      if (e.target.files.length > 0) {
        for (var fileInt = 0; fileInt < e.target.files.length; fileInt++)
          formData.append("file", e.target.files[fileInt]);

        let requestOptions = {
          headers: {},
          method: "POST",
          credentials: "include",
          body: formData,
        };

        var response = await fetch(
          localStorage.getItem("apiURL") + "GRCNextBPMN/uploadDocument",
          requestOptions
        );
        if (!response.ok) {
          alert("error");
          this.fileUploadArray[fileIndex] = false;
        } else {
          var body = await response.json();
          var ids = "";
          for (var responseInt = 0; responseInt < body.length; responseInt++) {
            var resposeJson = body[responseInt];
            if (responseInt == body.length - 1) ids += resposeJson["id"];
            else ids += resposeJson["id"] + ",";
          }
          this.values[id] = ids;
          this.fields[fileIndex]["value"] = ids;
          this.fileUploadArray[fileIndex] = true;
          this.allUploadFiles[fileIndex] = body;
        }
      }
    } else if (e.target.getAttribute("type") == "checkbox") {
      this.fields[e.target.getAttribute("index")]["value"] = e.target.checked;
      this.values[id] = e.target.checked;
    } else {
      this.fields[e.target.getAttribute("index")]["value"] = e.target.value;
      this.values[id] = e.target.value;
    }
  } catch (error) {
    alert("error");
    if (fileUploadCall) {
      this.fileUploadArray[fileIndex] = false;
    }
  }
  this.forceUpdate();
}

export async function fieldTypeAheadEdited(
  id,
  value,
  index,
  fields,
  values,
  nameJson,
  idJson
) {
  try {
    //var data = this.peopleIdJson[this.peopleNameJson.indexOf(value[0])];
    var data = idJson[nameJson.indexOf(value[0])];
    this.fields[index]["value"] = data;
    this.values[id] = data;

    this.forceUpdate();
  } catch (error) {
    alert("error");
  }
}

export function validationCheck(fields, values, validationSuccess) {
  for (var i = 0; i < fields.length; i++) {
    //console.log(fields[i]);
    //console.log(values[fields[i].id]);
    if (fields[i].type == "boolean") {
      if (
        fields[i].required &&
        (values[fields[i].id] === "" ||
          values[fields[i].id] === null ||
          typeof values[fields[i].id] === "undefined" ||
          values[fields[i].id] === false)
      ) {
        alert(fields[i].name + " Cannot be Empty");
        validationSuccess = false;
        break;
      }
    } else if (fields[i].type !== "dropdown") {
      if (
        fields[i].required &&
        (values[fields[i].id] === "" ||
          values[fields[i].id] === null ||
          typeof values[fields[i].id] === "undefined")
      ) {
        alert(fields[i].name + " Cannot be Empty");
        validationSuccess = false;
        break;
      }
    } else if (
      fields[i].required &&
      (values[fields[i].id] === null ||
        fields[i].options[0].name === values[fields[i].id] ||
        typeof values[fields[i].id] === "undefined")
    ) {
      alert("Select a value for " + fields[i].name);
      validationSuccess = false;
      break;
    }
  }
  return validationSuccess;
}

export function createInputControl(row, index) {
  switch (row["type"]) {
    case "text":
    case "integer":
    case "decimal":
      return createInputFieldByType("text", row, index, this.handleChange);

    case "upload":
      return createFileFieldByType("file", row, index, this.handleChange, this);

    case "date":
      return createInputFieldByType("date", row, index, this.handleChange);

    case "multi-line-text":
      return createTextArea(row, index, this.handleChange);

    case "dropdown":
      return createSelectOptions("select", row, index, this.handleChange);

    case "radio-buttons":
      return createRadioButton("radio", row, index, this.handleChange);

    case "expression":
      return createExpression("expression", row, index, this.handleChange);

    case "boolean":
      return createInputFieldByType("checkbox", row, index, this.handleChange);

    case "headline":
      return createHeader("text", row, index, this.handleChange);

    case "headline-with-line":
      return createHeaderWithLine("text", row, index, this.handleChange);

    case "people":
      return createPeople(
        "text",
        row,
        index,
        this.handleTypeAheadChange,
        this,
        index
      );

    case "functional-group":
      return createGroup("text", row, index, this.handleTypeAheadChange, this);

    default:
      return <label>not found</label>;
  }
}

function createInputFieldByType(type, row, index, handleChange) {
  return (
    <div
      className='form-group'
      style={{ marginTop: type == "checkbox" ? "5%" : "" }}
    >
      <Label
        for={row["name"]}
        className={type == "checkbox" ? "form-check-label" : ""}
      >
        {row["name"]}
      </Label>
      {Boolean(row["required"]) && <Label style={{ marginLeft: 3 }}>*</Label>}
      <Input
        name={row["name"]}
        index={index}
        type={type}
        placeholder={row["name"]}
        id={row["id"]}
        value={row["value"]}
        onChange={handleChange}
        className={type == "checkbox" ? "form-check-label" : "form-control"}
        style={{
          width: type == "checkbox" ? "auto" : "",
          height: type == "checkbox" ? "auto" : "",
          cursor: type == "checkbox" ? "pointer" : "",
          marginTop: type == "checkbox" ? "1.6%" : "",
          marginLeft: type == "checkbox" ? "3%" : "",
        }}
        defaultChecked={row["value"]}
        disabled={row["readOnly"]}
      ></Input>
    </div>
  );
}

function createFileFieldByType(type, row, index, handleChange, currentThis) {
  return (
    <div>
      <Label for={row["name"]} style={{ color: "#4e3636", fontSize: "14px" }}>
        {row["name"]}
      </Label>
      {Boolean(row["required"]) && <Label style={{ marginLeft: 3 }}>*</Label>}
      <div className='form-group' style={{ display: "flex", marginTop: "2%" }}>
        <Input
          name={row["name"]}
          index={index}
          type={type}
          placeholder={row["name"]}
          id={row["id"]}
          style={{
            width:
              row["params"] != null
                ? row["params"]["multiple"] === true
                  ? "42%"
                  : "31%"
                : "31%",
            padding: "3% 2%",
          }}
          onChange={handleChange}
          className={
            row["params"] != null
              ? row["params"]["multiple"] === true
                ? "form-control-multiple"
                : "form-control-file"
              : "form-control-file"
          }
          defaultChecked={row["value"]}
          disabled={row["readOnly"]}
          multiple={
            row["params"] != null
              ? row["params"]["multiple"] === true
                ? true
                : false
              : false
          }
        ></Input>
        {Boolean(
          currentThis.fileUploadArray[index] !== undefined &&
            currentThis.allUploadFiles[index] !== undefined &&
            currentThis.allUploadFiles[index].length > 0
        ) && (
          <OverlayTrigger
            trigger='click'
            placement='right'
            overlay={popover(
              currentThis.allUploadFiles[index],
              index,
              currentThis
            )}
            rootClose
          >
            <span style={{ marginLeft: "5%", marginTop: "2%" }}>
              <OverlayTrigger
                placement='right'
                delay={{ show: 850, hide: 250 }}
                overlay={renderTooltip(currentThis.allUploadFiles[index])}
              >
                <FontAwesomeIcon
                  icon={currentThis.fileUploadArray[index] ? faCheck : faTimes}
                  color={
                    currentThis.fileUploadArray[index]
                      ? "mediumspringgreen"
                      : "red"
                  }
                  size='2x'
                />
              </OverlayTrigger>
            </span>
          </OverlayTrigger>
        )}
      </div>
    </div>
  );
}

function createTextArea(row, index, handleChange) {
  return (
    <div className='form-group'>
      <Label for={row["name"]}>{row["name"]}</Label>
      {Boolean(row["required"]) && <Label style={{ marginLeft: 3 }}>*</Label>}
      <textarea
        name={row["name"]}
        index={index}
        className='form-control textarea_resize'
        placeholder={row["name"]}
        id={row["id"]}
        value={row["value"]}
        onChange={handleChange}
        disabled={row["readOnly"]}
      />
    </div>
  );
}

function createSelectOptions(type, row, index, handleChange) {
  return (
    <div>
      <Label for={row["name"]}>{row["name"]}</Label>
      {Boolean(row["required"]) && <Label style={{ marginLeft: 3 }}>*</Label>}
      <Input
        name={row["name"]}
        index={index}
        type={type}
        placeholder={row["name"]}
        id={row["id"]}
        value={row["value"]}
        onChange={handleChange}
        className='form-control'
        disabled={row["readOnly"]}
      >
        {Boolean(row["options"].length > 0) &&
          row["options"].map((json, i) => (
            <option key={i} value={json["name"]}>
              {json["name"]}
            </option>
          ))}
      </Input>
    </div>
  );
}

function createRadioButton(type, row, index, handleChange) {
  return (
    <div className='form-group' key={row["id"]}>
      <Label for={row["name"]}>{row["name"]}</Label>
      {Boolean(row["required"]) && <Label style={{ marginLeft: 3 }}>*</Label>}
      <br></br>
      {row["options"].map((opt, i) => (
        <div className='form-check form-check-inline' key={row["id"] + i}>
          <input
            name={row["name"]}
            key={i}
            index={index}
            type={type}
            id={row["id"]}
            value={opt["name"]}
            onChange={handleChange}
            className='form-check-input'
            style={{ cursor: "pointer" }}
            disabled={row["readOnly"]}
            defaultChecked={row["value"] == opt["name"] ? true : false}
          ></input>
          <label className='form-check-label'>{opt["name"]}</label>
        </div>
      ))}
    </div>
  );
}

function createExpression(type, row, index, handleChange) {
  return (
    <div className='form-group'>
      <Label>{row["value"]}</Label>
    </div>
  );
}

function createHeader(type, row, index, handleChange) {
  return (
    <>
      <header
        style={{
          width: "100%",
          textAlign: "center",
        }}
      >
        <h5>
          <b>{row["name"]} </b>
        </h5>
      </header>
    </>
  );
}

function createHeaderWithLine(type, row, index, handleChange) {
  return (
    <>
      <header
        style={{
          width: "100%",
          textAlign: "center",
        }}
      >
        <h3>
          <u>{row["name"]} </u>
        </h3>
      </header>
    </>
  );
}

function createPeople(type, row, index, handleTypeAheadChange, thisa) {
  return (
    <div className='form-group' key={row["id"]}>
      <Label for={row["name"]}>{row["name"]}</Label>
      {Boolean(row["required"]) && <Label style={{ marginLeft: 3 }}>*</Label>}
      <br></br>

      <div className='form-check form-check-inline' key={row["id"]}>
        <AsyncTypeahead
          id={row["id"]}
          name={row["name"]}
          labelKey={row["name"]}
          minLength={3}
          defaultInputValue={row["value"]}
          key={row["id"]}
          index={index}
          selectHintOnEnter={true}
          value={row["value"]}
          placeholder={row["name"]}
          onChange={handleTypeAheadChange.bind(
            this,
            row["id"],
            index,
            thisa.peopleNameJson[index],
            thisa.peopleIdJson[index]
          )}
          className='form-check-input'
          disabled={row["readOnly"]}
          onSearch={(userId) => {
            setPersonTypeAhead(thisa, userId, index);
          }}
          options={thisa.peopleNameJson[index]}
        />
      </div>
    </div>
  );
}

function createGroup(type, row, index, handleTypeAheadChange, thisa) {
  return (
    <div className='form-group' key={row["id"]}>
      <Label for={row["name"]}>{row["name"]}</Label>
      {Boolean(row["required"]) && <Label style={{ marginLeft: 3 }}>*</Label>}
      <br></br>

      <div className='form-check form-check-inline' key={row["id"]}>
        <AsyncTypeahead
          id={row["id"]}
          name={row["name"]}
          labelKey={row["name"]}
          placeholder={row["name"]}
          minLength={3}
          defaultInputValue={row["value"]}
          key={row["id"]}
          index={index}
          selectHintOnEnter={true}
          value={row["value"]}
          onChange={handleTypeAheadChange.bind(
            this,
            row["id"],
            index,
            thisa.groupNameJson[index],
            thisa.groupIdJson[index]
          )}
          className='form-check-input'
          disabled={row["readOnly"]}
          onSearch={(groupId) => {
            setGroupTypeAhead(thisa, groupId, index);
          }}
          options={thisa.groupNameJson[index]}
        />
      </div>
    </div>
  );
}

async function setPersonTypeAhead(thisa, groupId, typeAheadIndex) {
  /*if(json.length>0)
		state.peopleJson=json;
		else{
json.push("No Data");		
state.peopleJson=json;
		}	*/
  //thisa.setState({peopleJson:json[1]});
  //thisa.setState({isLoading:true});
  //state.isLoading = true;

  const requestOptions = {
    method: "GET",
    credentials: "include",
  };
  var response = await fetch(
    localStorage.getItem("apiURL") + "GRCNextBPMN/findUserId?id=" + groupId,
    requestOptions
  );

  if (!response.ok) {
  } else if (response.status === 200) {
    var json = await response.json();
    thisa.peopleNameJson[typeAheadIndex] = json[1];
    thisa.peopleIdJson[typeAheadIndex] = json[0];
    thisa.forceUpdate();
    console.log(thisa.peopleNameJson);
    return json;
  }
}

async function setGroupTypeAhead(thisa, groupId, typeAheadIndex) {
  /*if(json.length>0)
		state.peopleJson=json;
		else{
json.push("No Data");		
state.peopleJson=json;
		}	*/
  //thisa.setState({peopleJson:json[1]});
  //thisa.setState({isLoading:true});
  //state.isLoading = true;

  const requestOptions = {
    method: "GET",
    credentials: "include",
  };
  var response = await fetch(
    localStorage.getItem("apiURL") + "GRCNextBPMN/findGroupId?id=" + groupId,
    requestOptions
  );

  if (!response.ok) {
  } else if (response.status === 200) {
    var json = await response.json();
    thisa.groupNameJson[typeAheadIndex] = json[1];
    thisa.groupIdJson[typeAheadIndex] = json[0];
    thisa.forceUpdate();
    return json;
  }
}

/*export function createCardHeader(fieldIndex,workspaceIndex){
	return <CardHeader >
										 {this.createInputControl(this.fields[fieldIndex],fieldIndex)}
										 <a className="float-right" id="workspace" onClick={this.workspaceClick.bind(this,workspaceIndex)}>
												  <FontAwesomeIcon icon = {this.workspace[workspaceIndex] ? faChevronUp : faChevronDown} size="2x"/>
										 </a>
								  </CardHeader>
	
}*/

/*
export function createCardBody(fieldIndex,secondIndex,secondRow){
	 return secondRow["type"]!=null && secondRow["type"]!="headline-with-line" && secondRow["type"]!="headline"
							?
							<div className= "col-md-4"  style={{display: 'inline-block'}} key ={secondIndex} >
								{this.createInputControl(this.fields[fieldIndex],fieldIndex)}
								<div style={{display:'none'}}>{fieldIndex=fieldIndex+1}	</div>
								</div>
							:	
							<>
								{this.createInputControl(this.fields[fieldIndex],fieldIndex)}
								<div style={{display:'none'}}>{fieldIndex=fieldIndex+1}	</div>
							</>	
	
}*/

export function createRender(fieldIndex, workspaceIndex) {
  return (
    <div className='row ss background'>
      {this.extraFields.map((row, index) =>
        row["type"] != null &&
        row["type"] != "headline-with-line" &&
        row["type"] != "headline" ? (
          <div className='col-md-4' key={index}>
            {this.createInputControl(this.fields[fieldIndex], fieldIndex)}
            <div style={{ display: "none" }}>
              {(fieldIndex = fieldIndex + 1)}{" "}
            </div>
          </div>
        ) : (
          <div style={{ width: "100%" }} className='mt-4'>
            <Card
              style={{
                width: "inherit",
                height: "100%",
              }}
              className='cardRadius'
            >
              <div>
                <CardHeader className='cardHeader'>
                  {this.createInputControl(this.fields[fieldIndex], fieldIndex)}
                  <a
                    className='icon'
                    id='workspace'
                    onClick={this.workspaceClick.bind(this, workspaceIndex)}
                  >
                    <FontAwesomeIcon
                      icon={
                        this.workspace[workspaceIndex]
                          ? faChevronUp
                          : faChevronDown
                      }
                      size='2x'
                    />
                  </a>
                </CardHeader>
              </div>

              <UncontrolledCollapse
                isOpen={this.workspace[workspaceIndex]}
                toggler='#workspace'
              >
                <CardBody>
                  <div style={{ display: "none" }}>
                    {(fieldIndex = fieldIndex + 1)}{" "}
                  </div>
                  {row["boxFields"].map((secondRow, secondIndex) =>
                    secondRow["type"] != null &&
                    secondRow["type"] != "headline-with-line" &&
                    secondRow["type"] != "headline" ? (
                      <div
                        className='col-md-4'
                        style={{
                          display: "inline-block",
                          verticalAlign: "top",
                        }}
                        key={secondIndex}
                      >
                        {this.createInputControl(
                          this.fields[fieldIndex],
                          fieldIndex
                        )}
                        <div style={{ display: "none" }}>
                          {(fieldIndex = fieldIndex + 1)}{" "}
                        </div>
                      </div>
                    ) : (
                      <>
                        {this.createInputControl(
                          this.fields[fieldIndex],
                          fieldIndex
                        )}
                        <div style={{ display: "none" }}>
                          {(fieldIndex = fieldIndex + 1)}{" "}
                        </div>
                      </>
                    )
                  )}
                </CardBody>
              </UncontrolledCollapse>
            </Card>
            <div style={{ display: "none" }}>
              {(workspaceIndex = workspaceIndex + 1)}{" "}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export async function saveDocument(currentThis, eventId) {
  //console.log(id);
  try {
    let requestHeaders = {
      "Content-Type": "application/json",
    };
    var response = await fetch(
      localStorage.getItem("apiURL") +
        "flowable-task/app/rest/content/" +
        eventId,
      {
        method: "GET",
        headers: requestHeaders,
        dataType: "json",
        credentials: "include",
      }
    );
    if (response.status == 404) {
      console.log(response);
      alert("Server Down Check with network Administrator");
    } else if (response.status == 403) {
      alert("Not Authorize to download");
    } else if (response.status == 200) {
      var body = await response.json();

      currentThis.data = body;

      var dlink = document.createElement("a");
      dlink.href =
        localStorage.getItem("apiURL") +
        "flowable-task/app/rest/content/" +
        eventId +
        "/raw?name=" +
        currentThis.data["name"];
      //dlink.href = "http://localhost:8081/GRCNextBPMN/downloadFile";

      dlink.onclick = function (e) {
        // revokeObjectURL needs a delay to work properly
        var that = currentThis;
        setTimeout(function () {
          window.URL.revokeObjectURL(that.href);
        }, 1500);
      };

      dlink.click();
      dlink.remove();

      currentThis.forceUpdate();
    }
  } catch (error) {
    alert("Error Occured");
  }
}

const renderTooltip = (props) => (
  //bsPrefix={{backgroundColor:'white',border:'black'}}

  <Tooltip id='button-tooltip'>
    {props != undefined && props.length > 0 ? (
      props.map((row, index) => <div>{row["name"]}</div>)
    ) : (
      <div>No File Uploaded</div>
    )}
  </Tooltip>
);

export function popover(props, allFileIndex, currentThis) {
  return (
    <Popover id='popover-basic' style={{ width: "-webkit-fill-available" }}>
      <Popover.Title as='h3'>File Uploaded</Popover.Title>
      <Popover.Content>
        <>
          {currentThis.fileUploadArray[allFileIndex] && props.length > 0 ? (
            props.map((row, index) => (
              <>
                <div>
                  <a>
                    <FontAwesomeIcon
                      icon={faDownload}
                      color='dodgerblue'
                      onClick={saveDocument.bind(
                        "dummy",
                        currentThis,
                        row["id"]
                      )}
                      size='2x'
                    />
                  </a>
                  <a style={{ marginLeft: "5%" }}>{row["name"]}</a>
                  <a style={{ marginLeft: "5%" }}>
                    <FontAwesomeIcon
                      icon={faTimes}
                      color='red'
                      onClick={deleteDocument.bind(
                        "dummy",
                        allFileIndex,
                        index,
                        currentThis
                      )}
                      size='2x'
                    />
                  </a>
                </div>
              </>
            ))
          ) : (
            <div>No File Uploaded</div>
          )}
        </>
      </Popover.Content>
    </Popover>
  );
}

export function deleteDocument(allFileIndex, index, currentThis, events) {
  //console.log(id);
  try {
    var r = window.confirm(
      "Do you really want to delete file " +
        currentThis.allUploadFiles[allFileIndex][index]["name"] +
        "!"
    );
    if (r == true) {
      var deletedId = currentThis.allUploadFiles[allFileIndex][index]["id"];
      // console.log(deletedId);
      currentThis.allUploadFiles[allFileIndex].splice(index, 1);
      //console.log(allFileIndex);
      //console.log(index);
      //console.log(events);

      //console.log(currentThis.allUploadFiles);

      //this.values[id] = ids;
      //currentThis.fields[fileIndex]["value"] = ids;
      //console.log(currentThis.fields[allFileIndex]["id"]);
      //console.log(currentThis.values[currentThis.fields[allFileIndex]["id"]]);
      var ids = currentThis.values[
        currentThis.fields[allFileIndex]["id"]
      ].split(",");
      var newIds = "";
      for (var i = 0; i < ids.length; i++) {
        if (ids[i] != deletedId) {
          newIds += ids[i] + ",";
        }
      }
      newIds = newIds.substring(0, newIds.length - 1);
      currentThis.values[currentThis.fields[allFileIndex]["id"]] = newIds;
      currentThis.fields[allFileIndex]["value"] = newIds;
    } else {
    }
  } catch (error) {
    alert("Error Occured");
  }
  currentThis.forceUpdate();
}
