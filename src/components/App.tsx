import React, { useEffect, useState } from "react";
import './styles.css';
// @ts-ignore
import {addRequest, createGroup, getAllGroups, showRequests} from "../renderer";
// @ts-ignore
import { Req, Grp } from "src/types";
// import {db} from '../Database/DBManager';

type statusMap = {
    T: string
}
function App() {
    const [method, setMethod] = useState('get');
    const [url, setUrl] = useState('');
    const [response, setResponse] = useState('');
    const [responseMeta, setResponseMeta] = useState({
        status: 0,
        text: ''
    })
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [postBody, setPostBody] = useState('');
    const [group, setGroup] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState<number>(1);
    const [existingGroups, setExistingGroups] = useState<Grp[]>([]);
    const [groupedHistory, setGroupedHistory] = useState([]);

    const statusMapping: {[key: string]: string} = {
        "400": 'Bad Request',
        "401": 'Unauthorized',
        "403": 'Forbidden',
        "404": 'Not Found',
        "500": 'Internal Server Error',
        "502": 'Bad Gateway',
        "503": 'Service Unavailable',
        "200": 'Ok',
        "201": 'Created'
    };

    useEffect(()=> {
        const his = showRequests();
        // group based coupling
        let groupedHistoryCurr = his.reduce((prev: Req, curr: Req) => {
            if(prev[curr.requestGroupName]) {
                prev[curr.requestGroupName].push(curr);
            } else {
                prev[curr.requestGroupName] = [curr];
            }
            return prev;
        }, {});
        setGroupedHistory(groupedHistoryCurr)
        const grps = getAllGroups();
        setExistingGroups(grps);
        setSelectedGroupId(1)
    }, [response])

    function handleMethodChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setError('');
        setLoading(false);
        setResponse('');
        setMethod(e.target.value);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setError('');
        setLoading(false);
        setResponse('');
        setUrl(e.target.value);
    }

    async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        if(!url) {
            setError('Invalid URL');
            return;
        }

        if(method=='post' && !validateBody()) {
            setError('Invalid JSON');
            return;
        }
        if(method == "post" && !postBody) {
            setError('Empty Body');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(url, {
                headers: {
                    'Content-type': method === 'post' ? 'application/json' : '',
                },
                method: method,
                body: method == 'post' ? JSON.stringify(JSON.parse(postBody)) : null
            });
            const data = await res.json();

            addRequest(method, url, postBody, selectedGroupId);   
            setResponse(data);
            setResponseMeta({
                status: res.status,
                text: statusMapping[res.status+""]
            })
        } catch (error) {
            setError(error.message);
        }
        setLoading(false);
    }

    function handleBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setError('');
        setLoading(false);
        setResponse('');
        setPostBody(e.target.value);
    }

    function validateBody() {
        try {
            JSON.parse(postBody);
            return true;
        } catch (e) {
            return false;
        }
    }

    function handleHistoryItemClick(e: React.MouseEvent<HTMLDivElement>) {
        // @ts-ignore
        let idx = Number(e.target?.dataset?.id), key = e.target?.dataset?.key;
        if(!key) return;
        let historyData = groupedHistory[key][idx];
        setMethod(historyData.method);
        setUrl(historyData.url);
        setPostBody(historyData.body)
    }

    function handleGroupChange(e: React.ChangeEvent<HTMLInputElement>) {
        let inputText = e.target.value;
        setGroup(inputText);
    }
    function handleCreateGroup(e: React.MouseEvent<HTMLButtonElement>) {
        createGroup(group);
        // refetch groups
        const grps = getAllGroups();
        setExistingGroups(grps);
        setGroup('');
    }
    function handleExistingGroupChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedGroupId(Number(e.target.value))
    }

    return(
        <div className="main-container">
            <div className="top">
                <div className="req-container">
                    <div className="section-0">
                        <div className="left">
                            <div className="action">Select Group:</div>
                            <select id="methods" value={selectedGroupId} onChange={handleExistingGroupChange}>
                                {
                                    existingGroups.map((grp, id) => (
                                        <option key={id} value={grp.id}>{grp.name.toUpperCase()}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <h4>OR</h4>
                        <div className="right">
                            <div className="action">Add Group:</div>
                            <input type="text" value={group} onChange={handleGroupChange} placeholder="Add new group"/>
                            <button onClick={handleCreateGroup}>Save</button>                            
                        </div>
                    </div>
                    <div className="section-1">
                        <select id="methods" value={method} onChange={handleMethodChange}>
                            <option value='get'>GET</option>
                            <option value='post'>POST</option>
                        </select>
                        <input type="text" value={url} onChange={handleInputChange}/>
                        <button onClick={handleSubmit}>Send</button>
                    </div>
                    {
                        method === 'post' ? 
                            <div className="section-2">
                                <h4>Body:</h4>
                                <textarea id="post-body" rows={6} cols={50} placeholder='{ "key": "value" }' value={postBody} onChange={handleBodyChange}/>
                            </div> : null
                    }
                </div>
                <div className="res-container">
                    <h4>Response:</h4>
                    {
                        error ? 'Error: ' + error : null
                    }
                    {loading ? 'loading..' : (response ? <div className="res-window">
                        <div className="res-header">
                            {responseMeta.status} {responseMeta.text}</div>
                        <div className="res-body">{JSON.stringify(response)}</div>
                    </div> : null)}
                </div>
            </div>
            <div className="bottom">
                <h4>History:</h4>
                {
                    groupedHistory && Object.keys(groupedHistory).length ? 
                        <div className="history-tab">
                            {
                                Object.keys(groupedHistory).map((key, id) => (
                                    <div key={id} className="grp">
                                        <h5>{key}</h5>
                                        <div className="history-row" onClick={handleHistoryItemClick}>
                                        {
                                            // @ts-ignore
                                            groupedHistory[key].map((item, id2) => (
                                                <div key={id2} data-id={id} className="history">
                                                    <div data-id={id2} data-key={key} className="method">{(item.method).toUpperCase()}</div>
                                                    <div data-id={id2} data-key={key} className="url">{item.url}</div>
                                                </div>
                                            ))
                                        }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    : 'No Items'
                }
            </div>
        </div>
    )
}
export default App;