import { useState, useEffect, useCallback } from "react";

const useBattleLog = () => {
  const [logQueue, setLogQueue] = useState<string[]>([]);
  const [currentLogMessage, setCurrentLogMessage] = useState<string>("");
  const [currentDisplayedText, setCurrentDisplayedText] = useState("");

  const addToBattleLog = useCallback((newMessage: string) => {
    setLogQueue((prevQueue) => [...prevQueue, newMessage]);
  }, []);

  const processLogQueue = useCallback(() => {
    if (logQueue.length > 0 && currentLogMessage === "") {
      const nextMessage = logQueue[0];
      setLogQueue((prevQueue) => prevQueue.slice(1));

      let messageIndex = 0;
      const timer = setInterval(() => {
        setCurrentDisplayedText((prev) => prev + nextMessage[messageIndex]);
        messageIndex += 1;
        if (messageIndex === nextMessage.length) {
          clearInterval(timer);
          setTimeout(() => {
            setCurrentDisplayedText("");
            setCurrentLogMessage("");
          }, 1500);
        }
      }, 20);
    }
  }, [logQueue, currentLogMessage]);

  useEffect(() => {
    processLogQueue();
  }, [logQueue, currentLogMessage, processLogQueue]);

  return {
    addToBattleLog,
    currentDisplayedText,
    currentLogMessage,
  };
};

export default useBattleLog;
