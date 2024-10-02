import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';

document.getElementsByTagName('body')[0].appendChild(document.createElement('div')).classList.add('content-component')
function getEditor(setEditor){
      // Use a query selector to find the Ace Editor element
      const aceEditorElement = document.querySelector('ace-editor');

      if (aceEditorElement) {
          // Access the Ace Editor instance
          const editor = aceEditorElement.env.editor; // Ensure this path is correct

          if (editor) {
              console.log(editor.getValue());
              setEditor(editor);
          } else {
              console.log('Ace Editor no data');
          }
      } else {
          console.log('Ace Editor element not found');
      }
}
const Content = () => {

  const [editor, setEditor] = useState();
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [prompt, setPrompt] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = () => {
    if(openPopup){
      setOpenPopup(false);
    }else{
      setOpenPopup(true);
    }
  }   

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const assistantId = 'asst_3eKaAhaV6u0x6J1mNiKSl6yS'; // Replace with your actual assistant ID
    const token = {token}
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'OpenAI-Beta': 'assistants=v2'
    };

    try {
      // Create a thread
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: headers
      });
      const threadData = await threadResponse.json();
      const threadId = threadData.id;

      // Add a message to the thread
      await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          role: "user",
          content: prompt
        })
      });

      // Run the assistant
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          assistant_id: assistantId
        })
      });
      const runData = await runResponse.json();
      const runId = runData.id;

      // Poll for completion
      let runStatus;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          headers: headers
        });
        const statusData = await statusResponse.json();
        runStatus = statusData.status;
      } while (runStatus !== 'completed');

      // Get the messages
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        headers: headers
      });
      const messagesData = await messagesResponse.json();
      const generatedCode = messagesData.data[0].content[0].text.value;

      // Remove code block markers from the generated code
      const newgeneratedCode = generatedCode.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '');
      editor.setValue(newgeneratedCode);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const aceEditorElement = document.querySelector('ace-editor');
      if (aceEditorElement && aceEditorElement.env && aceEditorElement.env.editor) {
            console.log('Ace Editor is ready.');
            setIsEditorReady(true);
            getEditor(setEditor);
            observer.disconnect(); // Stop observing after we find the element
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
        {isEditorReady ? (
          <button
            onClick={handleClick}
            className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-dark-surface text-light-text px-4 py-2 rounded-full shadow-lg hover:bg-opacity-80 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 z-50 text-[16px]"
          >
            {openPopup ? "X" : "Ask AI 🤖"}
          </button>
        ) : null}
        {openPopup && (
          <form onSubmit={handleSubmit}>
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-80 bg-dark-background rounded-lg shadow-lg p-4 z-50">
            <textarea
              className={`w-full h-32 bg-dark-surface text-light-text p-2 rounded-md mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              placeholder="Ask AI to code..."
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            ></textarea>
            <button
              className= {`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Submit"}
            </button>
          </div>
          </form>
        )}
    </>
  );
};

export default Content;


render(<Content/>,document.getElementsByClassName("content-component")[0]);