import React from 'react';
import './App.css';
const clientId = 'o9ai1orr9lfs2r17tnwgz4hm6i5j6z';
const clientSecret = process.env.REACT_APP_TCS;
var accessToken;

const postToken = async function () {
  const url = 'https://id.twitch.tv/oauth2/token'
    + '?client_id=' + clientId
    + '&client_secret=' + clientSecret
    + '&grant_type=client_credentials';
  const r = await fetch(url, {
    method: 'POST'
  });
  return r.json();
}

const getUserByName = async function (name) {
  const r = await fetch('https://api.twitch.tv/helix/users?login=' + name, {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
      'Authorization': 'Bearer ' + accessToken
    }
  });
  return r.json();
}

const getFollowingById = async function (user_id, after) {
  const r = await fetch('https://api.twitch.tv/helix/users/follows?from_id=' + user_id + (after ? '&after=' + after : ''), {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
      'Authorization': 'Bearer ' + accessToken
    }
  })
  return r.json();
}

const getUserById = async function (user_id) {
  const r = await fetch('https://api.twitch.tv/kraken/users/' + user_id, {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  })
  return r.json();
}

const populateFollows = function (r, userId, userName, cursor) {
  getFollowingById(userId, cursor).then(async r => {
    if (document.currentName.toLowerCase() !== userName.toLowerCase()) {
      return;
    }
    const es = r.data.sort(function (a, b) {
      return new Date(b.followed_at) - new Date(a.followed_at);
    });
    for (var i = 0; i < es.length; i++) {
      const e = es[i];
      const fDate = new Date(e.followed_at);
      if (document.currentName.toLowerCase() !== userName.toLowerCase()) {
        return;
      }
      const resp = await getUserById(e.to_id);
      if (document.currentName.toLowerCase() !== userName.toLowerCase()) {
        return;
      }
      const elem = document.getElementById('cont');
      var line = '<div>'
      line += '<a href="https://www.twitch.tv/' + resp.name + '" target="_blank">' + resp.display_name + '</a>';
      line += '\t(' + fDate.getFullYear() + '/' + (fDate.getMonth() + 1) + '/' + fDate.getDate() + ')';
      line += '</div>';
      elem.innerHTML += line;
    }
    if (es.length > 0 && r.pagination && r.pagination.cursor) {
      populateFollows(r, userId, userName, r.pagination.cursor)
    }
  });
}

const populatePage = function (r) {
  if (r.data[0].profile_image_url) {
    const elem = document.getElementById('title');
    elem.innerHTML += '<img src="' + r.data[0].profile_image_url + '" />'
  }
  const userName = r.data[0].login;
  const userId = r.data[0].id;
  populateFollows(r, userId, userName);
}

const startFind = async function () {
  document.getElementById('title').innerHTML = '';
  document.getElementById('cont').innerHTML = '';

  const name = document.getElementById('name').value;
  document.currentName = name;
  const d = await getUserByName(name);
  if (d && d.data && d.data.length > 0) {
    populatePage(d)
  } else {
    document.getElementById('title').innerHTML = '<div>체크 아이디 플리즈</div>';
  }
}

class App extends React.Component {
  componentDidMount() {
    document.currentName = 'heehee1004';
    postToken().then(r => {
      accessToken = r.access_token;
      getUserByName('heehee1004').then(populatePage);
    });

    document.getElementById("name").addEventListener('keyup', function (event) {
      if (event.keyCode === 13) {
        startFind();
      }
    });
  }
  
  render() {
    
    return (
      <div className="App">
        아이디: <input type="text" id="name" placeholder="heehee1004" />
        <input id="findButton" type="button" value="ㄱㄱ" onclick="startFind();" />
        <div id='title' />
        <div id='cont' />
      </div>
    );
  }
}
export default App;
