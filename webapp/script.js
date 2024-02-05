const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;

const loadDataFromLocalstorage = () => {
    // Load saved chats and theme from local storage and apply/add on the page
    const themeColor = localStorage.getItem("themeColor");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1> Gen AI ChatBot </h1>
                            <p> Powered by AWS Serverless & Amazon Bedrock </p>
                            <p>Start a conversation and explore the power of AWS AI/ML Services.</p>
                            <p> <i>Developed by Paul & Arjun </i> <a href="https://www.linkedin.com/in/paulkannan/" target="_blank"><i class="fab fa-linkedin"></i></a> 
                            <a href="https://www.linkedin.com/in/arjun-arippa/" target="_blank"><i class="fab fa-linkedin"></i></a></p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom of the chat container
    console.log("Loaded data from local storage");
}

const createChatElement = (content, className) => {
    // Create a new div and apply chat, specified class, and set HTML content of the div
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv; // Return the created chat div
}

const getChatResponse = async (incomingChatDiv, userInput) => {
    // Original API endpoint
    const defaultApiEndpoint = "https://defyzdh8v2.execute-api.us-east-1.amazonaws.com/dev/";

    // API endpoint for image processing
    const imageApiEndpoint = "https://qckqy1fwz2.execute-api.us-east-1.amazonaws.com/dev/";  


    // Check if the user input is empty
    if (!userInput) {
        // You might want to handle this case, e.g., show an error message or return
        console.error('User input is empty.');
        return;
    }

    // Determine the appropriate API endpoint and construct the inputString
    let apiEndpoint;
    let inputString;

    const isQaInput = userInput.toLowerCase().startsWith('qa:');

    apiEndpoint = isQaInput ? qaApiEndpoint : (userInput.toLowerCase().includes('image') ? imageApiEndpoint : defaultApiEndpoint);

    if (isQaInput) {
        const query = userInput.substring(3).trim(); // Exclude 'qa:' from the input and trim spaces
        inputString = `{"query": "${query}"}`;
    } else {
        inputString = `Human: ${userInput}\n\nAssistant:`;
    }

   
    // Determine the appropriate API endpoint based on user input
    //const apiEndpoint = userInput.toLowerCase().includes('image') ? imageApiEndpoint : defaultApiEndpoint;

    //const apiEndpoint = userInput.toLowerCase().includes('image') ? imageApiEndpoint : 
                    //userInput.toLowerCase() === 'rag' ? qaApiEndpoint : 
                    //defaultApiEndpoint;


    // Construct the inputString
    //const inputString = `Human: ${userInput}\n\nAssistant:`;
    console.log("input string: ", inputString);

    console.log("apiendpoint: ", apiEndpoint);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
/*
    const raw = {
        "input": inputString
    };
*/
     // Use the raw variable based on the condition
    const raw = isQaInput ? JSON.parse(`{"query": "${userInput.substring(3).trim()}"}`) : { "input": inputString };

     // Continue using the raw variable in the rest of the code...
     console.log("Request body:", JSON.stringify(raw));   
  
    //const raw = JSON.parse(inputString);

    console.log("Request body:", JSON.stringify(raw));

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(raw),
        redirect: 'follow'
    };

    try {
        const response = await fetch(apiEndpoint, requestOptions);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const apiResponse = await response.json();

        // Process the API response
        if (apiResponse) {
            console.log("API Response:", apiResponse); // Debug log    
            
            console.log("API Response body:", apiResponse.body); // Debug log   // Debug log  

            // Check if the response is an image
            if (apiResponse.body && apiResponse.body.includes('"download_url"')) {
                // Parse the JSON response
                var parsedData = JSON.parse(apiResponse.body);
                console.log("Parsed Data: ", parsedData);

                // Extract the download_url from the parsed data
                var downloadUrl = parsedData.download_url;
                console.log("Parsed url: ", downloadUrl);   
                
                const pElement = document.createElement("p");
                pElement.innerHTML = downloadUrl; // Use 'Answer' property from the API response

                // Remove the typing animation, append the paragraph element, and save the chats to local storage
                incomingChatDiv.querySelector(".typing-animation").remove();
                incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
                localStorage.setItem("all-chats", chatContainer.innerHTML);
                chatContainer.scrollTo(0, chatContainer.scrollHeight);
                console.log("Chat container updated with API response");       

            } else if (apiResponse.body) {
                // Handle text response
                var parsedData = JSON.parse(apiResponse.body);
                var answer = parsedData.Answer;

                var formattedAnswer = answer.replace(/\\n/g, '<br>');

                console.log("API with formatted Answer :", formattedAnswer);

                const pElement = document.createElement("p");
                pElement.innerHTML = formattedAnswer; // Use 'Answer' property from the API response

                // Remove the typing animation, append the paragraph element, and save the chats to local storage
                incomingChatDiv.querySelector(".typing-animation").remove();
                incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
                localStorage.setItem("all-chats", chatContainer.innerHTML);
                chatContainer.scrollTo(0, chatContainer.scrollHeight);
                console.log("Chat container updated with API response");
            }
            
        } else {
            // Handle the case where the API call was not successful
            // You might want to display an error message or take other actions
            console.error('API call did not return a valid response.');
        }
    } catch (error) {
        // Handle errors from the API call
        console.error('Error in getChatResponse:', error);
        // You might want to display an error message or take other actions
    }
};


const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
    console.log("Response copied to clipboard");
}

const showTypingAnimation = () => {
    // Display the typing animation and call the getChatResponse function
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/aws.gif" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
    // Create an incoming chat div with typing animation and append it to the chat container
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv, userText);
    console.log("Showing typing animation");
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim(); // Get chatInput value and remove extra spaces
    if (!userText) return; // If chatInput is empty, return from here

    // Clear the input field and reset its height
    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.gif" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    // Create an outgoing chat div with the user's message and append it to the chat container
    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
    console.log("Handling outgoing chat");
}

deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalstorage function
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
        console.log("Chats deleted");
    }
});

themeButton.addEventListener("click", () => {
    // Toggle body's class for the theme mode and save the updated theme to the local storage 
    document.body.classList.toggle("light-mode");
    localStorage.setItem("themeColor", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    console.log("Theme button clicked");
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
    console.log("Input field height adjusted");
});

chatInput.addEventListener("keydown", (e) => {
    // If the Enter key is pressed without Shift and the window width is larger 
    // than 800 pixels, handle the outgoing chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
        console.log("Enter key pressed. Handling outgoing chat");
    }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);
console.log("Script loaded successfully");
