import { useState } from "react";
import Title from "./Title";
import axios from "axios";
import RecordMessage from "./RecordMessage";

const Controller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  function createBlobURL(data: any) {
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    return url;
  }

  const handleStop = async (blobUrl?: string) => {
    setIsLoading(true);

    try {
      if (!blobUrl) return;

      // Fetch recorded audio blob
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      // Construct form data with audio blob
      const formData = new FormData();
      formData.append("file", blob, "myFile.wav");

      // Send form data to API endpoint
      const res = await axios.post("http://localhost:8000/post-audio", formData, {
        headers: {
          "Content-Type": "audio/mpeg",
        },
        responseType: "arraybuffer", // Set the response type to handle binary data
      });

      // Create blob URL from response data
      const audioBlobUrl = createBlobURL(res.data);

      // Append Rachel's message to messages
      const rachelMessage = { sender: "rachel", blobUrl: audioBlobUrl };
      setMessages((prevMessages) => [...prevMessages, rachelMessage]);

      // Play audio
      const audio = new Audio(audioBlobUrl);
      audio.play();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-hidden">
      {/* Title */}
      <Title setMessages={setMessages} />

      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
        {/* Conversation */}
        <div className="mt-5 px-5">v
          {messages?.map((audio, index) => (
            <div
              key={index + audio.sender}
              className={"flex flex-col " + (audio.sender === "rachel" && "flex items-end")}
            >
              {/* Sender */}
              <div className="mt-4 ">
                <p className={audio.sender === "rachel" ? "text-right mr-2 italic text-green-500" : "ml-2 italic text-blue-500"}>
                  {audio.sender}
                </p>

                {/* Message */}
                <audio src={audio.blobUrl} className="appearance-none" controls />
              </div>
            </div>
          ))}

          {messages.length === 0 && !isLoading && (
            <div className="text-center font-light italic mt-10">
              Send Rachel a message...
            </div>
          )}

          {isLoading && (
            <div className="text-center font-light italic mt-10 animate-pulse">
              Gimme a few seconds...
            </div>
          )}
        </div>

        {/* Recorder */}
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-sky-500 to-green-500">
          <div className="flex justify-center items-center w-full">
            <div>
              <RecordMessage handleStop={() => handleStop()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controller;
