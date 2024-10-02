chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(request.action === "generate_code"){
    // Call OpenAI API to generate code
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_OPENAI_API_KEY' // Replace with your actual API key
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: request.prompt }],
        max_tokens: 150
      })
    })
    .then(response => response.json())
    .then(data => {
      const generatedCode = data.choices[0].message.content;
      sendResponse({ message: "success", code: generatedCode });
    })
    .catch(error => {
      console.error('Error:', error);
      sendResponse({ message: "error", details: error.message });
    });

    // Return true to indicate that the response will be sent asynchronously
    return true;
	}
});
