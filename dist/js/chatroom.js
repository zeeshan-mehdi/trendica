
// function to get the userKey for logged in user
function getLoggedUserKey(){
	return localStorage.getItem("userKeySession");
}

// function to get the username based on email for logged in user
function getLoggedUsername(){
	var email = localStorage.getItem("userSession");
	var userName = email.substr(0, email.indexOf('@')); 
	return userName;
}

// global variable
var chatroomID;
// global variable to trace if it's refresh or just the first page onload to set differnt css for li item
var refresh = false;

function loadChat(){
	// refresh contact list upon successful add new contact from search
	$('#contacts ul').empty();
	
	// update logged in user at top bar	
	document.getElementById("topbar_userSession").innerHTML = 'Welcome,  ' + getLoggedUsername();
	
	// display list of chat by logged in user
	var chatlist = [];
	var userKey = getLoggedUserKey();
	
	// find the list of chatroomID which the logged in user involved in
	getAllChatrooms().then((arr) => {
		for(var i = 0; i < arr.length; i++){
			// split the recipient and sender ID based on the concat chatroomID
			var fields = arr[i].chatroomID.split('!');
			var str1 = fields[0];
			var str2 = fields[1];
			if(str1 == userKey || str2 == userKey){
				chatlist.push(arr[i]);
			}
		}
		
		const sorted = chatlist.sort((a, b) => {
			// concat the date and time, then parse it to a Date and get the timestamp
			const aDate = new Date(a.date + ' ' + a.time)
			const bDate = new Date(b.date + ' ' + b.time)
			// sort in descending order so latest one will be on top
			return bDate.getTime() - aDate.getTime()
		})
		
		for(var i = 0; i < sorted.length; i++){
			
			// format string to be displayed
			var contact = '',
			    preview = '';
			
			if(sorted[i].sender != getLoggedUsername()){
				contact = sorted[i].sender;
				preview = sorted[i].sender + ': ' + sorted[i].message;
			}else{
				contact = sorted[i].userName2;
				preview = 'You: ' + sorted[i].message;
			}
			
			if(i == 0 && refresh == true){
				// if it is first item and comes from submitting new message, set li tag as active; if first time onload for page, dont set
				contact = sorted[i].userName2;
				preview = '<span>You: </span>' + sorted[i].message;
			}
			
			// populate the list at the left
			$('<li class="contact"><div class="wrap"><div class="meta"><p class="name">' + contact + '</p><p class="preview">' + preview + '</p></div></div></li>').appendTo($('#contacts ul'));
		}
		
		// upon refresh after submit new message set first one as active since it's the latest one
		if(refresh == true){
			$('#contacts li:first').addClass('active');
			refresh = false;
		}
		
		$('#contacts li').click(function() {
			var index = $(this).index();
			chatroomID = sorted[index].chatroomID;
			// switch around the contact name to be displayed on top
			var contactName = (sorted[index].sender != getLoggedUsername()? sorted[index].sender : sorted[index].userName2);
			// reset the list upon reselect on the contact list
			$('.messages ul').empty();
			// remove previously active li so that it is only single select
			$("#contacts li").removeClass("active");
			$(this).addClass("active");
			loadChatDetail(contactName);
		});
		
	});
}

// function to show chat message details in message panel
var refreshChat = function(chatlist){
	// empty previous list of messages
	$('.messages ul').empty();
	
	var time = '';
	var date = '';
	for(var i = 0; i < chatlist.length; i++){
		// messages sent by logged in user is considered as sent, otherwise as replies
		if(chatlist[i].sender == getLoggedUsername()){
			$('<li class="sent"><p>' + chatlist[i].message + '</p></li>').appendTo($('.messages ul'));
		}else{
			$('<li class="replies"><p>' + chatlist[i].message + '</p></li>').appendTo($('.messages ul'));
		}
		time = chatlist[i].time;
		date = chatlist[i].date;
	}
		
	// update last sent info
	var month = date.substring(0, 2);
	var day = date.substring(3, 5);
	var year = date.substring(6, 10);
	if(day != ''){
		document.getElementById('last-timeframe').innerHTML = '<i> (Last message sent on ' + day + '/' + month + '/' + year + ' ' + time + ')</i>';
	}else{
		// if comes from search result, dont show the last message sent time frame
		document.getElementById('last-timeframe').innerHTML = '';
	}
}

// function to load the details for selected chat
function loadChatDetail(contact){
	// set the contact name displayed at the top
	document.getElementById('contact-profileName').innerHTML = contact;
	
	var date, time, sender, message, recipient;
	var onChangeChatroom;
	
	// used on value to listen to changes in database
	var query = firebase.database().ref('chats').child(chatroomID);
		query.on("value", function(data) {
			// reinitialize chatlist to empty upon changes in database
			var chatlist = [];
			// get the chatroomID with value changed
			onChangeChatroom = data.key;
			data.forEach(snapshot => {
				var chatData = snapshot.val();
				date = chatData.date;
				time = chatData.time;
				message = chatData.message;
				recipient = chatData.recipient;
				sender = chatData.sender;
				// repopulate the chat messages
				chatlist.push({date: date, time: time, message: message, recipient: recipient, sender: sender});
			});
		
			// if selected chatroom equals to the chatroom with changes detected, then refresh list at the lhs and message panel. If different, do not refresh panel
			if(chatroomID == onChangeChatroom){
				// for receiving end to update the list at left hand side
				if(chatlist[chatlist.length - 1 ].sender == getLoggedUsername()){
					$('.contact.active .preview').html('You: ' + message);
				}else{
					$('.contact.active .preview').html(chatlist[chatlist.length -1 ].sender + ': ' + message);
				}
				// refresh chat panels
				refreshChat(chatlist);
			}
	});
}

// function to filter out swear words
function filterBadwords(){
	var input = document.getElementById('msginput'),
		output = document.getElementById('msginput'),
		badwords = /\b(ass|arse|assface|assfuck|asshole|bastard|bitch|cock|cum|dick|dickhead|dumbfuck|fag|faggot|fuck|gay|handjob|hoe|motherfucker|nigger|nigga|penis|pussy|shit|tit|twat|whore|kpkb|nabei|nabu|yao siu|pu bor gia|cb|hong gan|kan)\b/g;

	input.onkeyup = function () {
		output.value = this.value.replace(badwords, function (fullmatch, badword) {
			return new Array(badword.length + 1).join('*');
		});
	};
}

// function to submit new message
function newMessage(){	
	// split the chatroomID to get recipient ID and senderIDs
	var fields = chatroomID.split('!');
	var userName1 = fields[0];
	var userName2 = fields[1];
	
	var senderKey = '',
	    receipientKey = '';
	// switch around to update the latest sender together with the other party in the chat
	// need this to prevent the sender and recipient become the same person
	if(userName1 == getLoggedUserKey()){
		senderKey = userName1;
		recipientKey = userName2;
	}else{
		senderKey = userName2;
		recipientKey = userName1;
	}
	
	// format today date
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; // January is 0
	var yyyy = today.getFullYear();

	if(dd < 10) { dd = '0' + dd } 

	if(mm < 10) { mm = '0' + mm } 
	
	today = mm + '/' + dd + '/' + yyyy;
	
	// format current time
	var date = new Date();
    var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    var am_pm = date.getHours() >= 12 ? "PM" : "AM";
    hours = hours < 10 ? "0" + hours : hours;
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    time = hours + ":" + minutes + ":" + seconds + " " + am_pm;
		
	// username for logged in user
	var sender = getLoggedUsername();
	var userName2 = '';
	
	// message input
	message = $(".message-input input").val();

	if($.trim(message) == '') {
		// empty fields do not insert
		return false;
	}else{
		// reset the input text to empty
		$('.message-input input').val(null);
		
		// loop to get the username of recipient
		getAllAccounts().then((accountlist) => {
			// once found matching accountID, substring the email to get its username
			for(var i = 0; i < accountlist.length; i++){
				if(accountlist[i].accountID == recipientKey){
					var email = accountlist[i].email;
					userName2 = email.substr(0, email.indexOf('@'));
				}
			}
			
			// insert new message under certain chat room
			firebase.database().ref('chats').child(chatroomID).push({
				sender: sender,
				recipient: userName2,
				message: message,
				date: today,
				time: time
			});
			
			// remove the latest message before insert new one so it will only show the latest one
			firebase.database().ref('chatrooms').child(chatroomID).remove();
			// update chatrooms with latest message to be display on the list
			firebase.database().ref('chatrooms').child(chatroomID).update({
				sender: sender,
				userName2: userName2,
				message: message,
				date: today,
				time: time
			});
			
			// update last sent info
			document.getElementById('last-timeframe').innerHTML = '<i> (Last message sent on ' + dd + '/' + mm + '/' + yyyy + ' ' + time + ')</i>';
			
			// reload list upon successful insert
			refresh = true; // set refresh to true so I know new message coming in rather than first onload for loadChat()
			// refresh the preview at the left hand side list
			loadChat();
		});
	}
}

$('.submit').click(function() {
	newMessage();
});

// function to perform search
function search(){
	// clear previously appended li items
	$('#searches ul').empty();
	// get search value
	searchi = $("#search input").val();

	if(searchi == '') {
		// hide search result and show contacts list
		document.getElementById('contacts').style.display = 'block';
		document.getElementById('searches').style.display = 'none';
	}else{
		// hide the list and show search result
		document.getElementById('searches').style.display = 'block';
		document.getElementById('contacts').style.display = 'none';
	}
	
	// get list of all accounts then filter to find for advertiser user type only
	getAllAccounts().then((accountlist) => {
		var filteredlist = [];
		
		for(var i = 0; i < accountlist.length; i++){
			if(accountlist[i].accountType == 'advertiser'){
				// if contain search keywords then push to array
				if(accountlist[i].email.indexOf(searchi) != -1){
					filteredlist.push(accountlist[i]);
				}
			}
		}

		// sort the search result in alphabetical order
		filteredlist.sort((a, b) => a.email !== b.email ? a.email < b.email ? -1 : 1 : 0);
		
		// display in the list of search result
		for(var i = 0; i < filteredlist.length; i++){
			$('<li class="searchr"><div class="wrap"><div class="meta"><p class="name">' + filteredlist[i].email + '</p></div></div></li>').appendTo($('#searches ul'));
		}
		
		$('#searches').on('click', 'li', function() {
			var index = $(this).index();
			// concat the account ID of selected search user together with the ID of logged in user
			chatroomID = filteredlist[index].accountID + '!' + getLoggedUserKey();
			// format the string to be display as contact name
			var email = filteredlist[index].email;
			var userName = email.substr(0, email.indexOf('@')); 
			loadChatDetail(userName);
			// reset the list 
			$('.messages ul').empty();
			
			// hide search result and show contacts list
			document.getElementById('contacts').style.display = 'block';
			document.getElementById('searches').style.display = 'none';
			document.getElementById('searchInput').value = '';
		});
		
	});
	
}