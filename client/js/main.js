(function () {

    function _getNode(s) {
        return document.querySelector(s)
    }

    // Get required nodes
    var textarea = _getNode('.chat textarea'),
        messages = _getNode('.chat-messages'),
        chatName = _getNode('.chat-name'),
        status = _getNode('.chat-status span');

    var defaultStatus = status.textContent;

    function _setStatus(s) {
        status.textContent = s;

        if (s !== defaultStatus) {
            var delay = setTimeout(function () {
                _setStatus(defaultStatus);
                clearInterval(delay);
            }, 3000);
        }
    }

    // Connection
    var socket;
    try {
        socket = io.connect('http://127.0.0.1:9000');
    } catch (e) {
        // Set status to warn the user
    }

    if (socket !== undefined) {

        // Listen for message
        socket.on('message', function (data) {
            if (data.length) {
                // Loop through result
                for (var i = 0; i < data.length; i++) {
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[i].name + ': ' + data[i].message;

                    // Append
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.firstChild);
                }
            }
        });

        // Listen for a status
        socket.on('status', function (data) {
            _setStatus(typeof data === 'object' ? data.message : data);

            if (data.clear === true)
                textarea.value = '';
        });

        // Listen for keydown
        textarea.addEventListener('keydown', function (event) {
            const message = this.value,
                name = chatName.value;

            if (event.which === 13 && event.shiftKey === false) {
                socket.emit('data', {
                    name: name,
                    message: message
                });
                event.preventDefault();
            }
        });
    }
})();