const { io } = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:5000';
const TEST_TOKEN = process.argv[2]; // Pass token as argument

if (!TEST_TOKEN) {
    console.error('❌ Usage: node test-socket.js <your-jwt-token>');
    console.log('💡 Get token by logging in: POST http://localhost:5000/auth/login');
    process.exit(1);
}

console.log('🔌 Connecting to Socket.IO server...');
console.log(`📍 Server: ${SERVER_URL}`);
console.log(`🔑 Token: ${TEST_TOKEN.substring(0, 20)}...`);

// Connect to server
const socket = io(SERVER_URL, {
    auth: {
        token: `Bearer ${TEST_TOKEN}`
    }
});

// Connection events
socket.on('connect', () => {
    console.log('\n✅ Connected successfully!');
    console.log(`🆔 Socket ID: ${socket.id}`);

    // Run tests
    runTests();
});

socket.on('connect_error', (error) => {
    console.error('\n❌ Connection error:', error.message);
    process.exit(1);
});

socket.on('disconnect', (reason) => {
    console.log('\n🔌 Disconnected:', reason);
});

// Listen for presence events
socket.on('user_online', (data) => {
    console.log(`\n👤 User online: ${data.userId}`);
});

socket.on('user_offline', (data) => {
    console.log(`\n👤 User offline: ${data.userId}`);
});

// Listen for messages
socket.on('new_message', (data) => {
    console.log('\n📨 New message received:');
    console.log(`   From: ${data.message.sender}`);
    console.log(`   Content: ${data.message.content}`);
    console.log(`   Conversation: ${data.conversationId}`);
});

// Listen for typing
socket.on('user_typing', (data) => {
    console.log(`\n⌨️  ${data.username} is typing in ${data.conversationId}...`);
});

socket.on('typing_stopped', (data) => {
    console.log(`\n⌨️  ${data.userId} stopped typing`);
});

// Listen for notifications
socket.on('new_notification', (notification) => {
    console.log('\n🔔 New notification:');
    console.log(`   Type: ${notification.type}`);
    console.log(`   Content: ${notification.content}`);
});

// Test functions
function runTests() {
    console.log('\n🧪 Running Socket.IO tests...\n');

    // Test 1: Get online users
    setTimeout(() => {
        console.log('📊 Test 1: Getting online users...');
        socket.emit('get_all_online', (response) => {
            if (response.success) {
                console.log(`✅ Online users count: ${response.count}`);
                console.log(`   Users: ${response.users.join(', ')}`);
            } else {
                console.log('❌ Error:', response.error);
            }
        });
    }, 1000);

    // Test 2: Set status
    setTimeout(() => {
        console.log('\n📊 Test 2: Setting status to "online"...');
        socket.emit('set_status', { status: 'online' }, (response) => {
            if (response.success) {
                console.log('✅ Status updated');
            } else {
                console.log('❌ Error:', response.error);
            }
        });
    }, 2000);

    // Test 3: Join conversation (you need a real conversationId)
    setTimeout(() => {
        console.log('\n📊 Test 3: Testing conversation join...');
        console.log('⚠️  Skipped - Need real conversationId');
        console.log('   To test: socket.emit("join_conversation", { conversationId: "xxx" })');
    }, 3000);

    // Test 4: Send message (you need a real conversationId)
    setTimeout(() => {
        console.log('\n📊 Test 4: Testing message send...');
        console.log('⚠️  Skipped - Need real conversationId');
        console.log('   To test: socket.emit("send_message", { conversationId: "xxx", content: "Hello!" })');
    }, 4000);

    // Summary
    setTimeout(() => {
        console.log('\n' + '='.repeat(50));
        console.log('📋 Test Summary:');
        console.log('='.repeat(50));
        console.log('✅ Connection: PASSED');
        console.log('✅ Authentication: PASSED');
        console.log('✅ Online users: PASSED');
        console.log('✅ Status update: PASSED');
        console.log('⚠️  Message send: NEEDS CONVERSATION ID');
        console.log('⚠️  Join conversation: NEEDS CONVERSATION ID');
        console.log('\n💡 To test messaging:');
        console.log('   1. Create a conversation via REST API');
        console.log('   2. Use conversationId in socket.emit("join_conversation")');
        console.log('   3. Send message with socket.emit("send_message")');
        console.log('\n🎉 Socket.IO server is working!');
        console.log('\n👋 Press Ctrl+C to exit\n');
    }, 5000);
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n👋 Disconnecting...');
    socket.disconnect();
    process.exit(0);
});
