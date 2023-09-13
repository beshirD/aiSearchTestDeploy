import { Flex, Box, Text, Input, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import axios from "axios";

function ChatbotUI({token}:any) {
  const [messages, setMessages] = useState('');
  const [question, setQuestion] = useState("");
    const [loading,setLoading] = useState(false);
    const [answer, setAnswer] = useState('');


  const answerQuestion = async () => {
    setLoading(true);
    try {
      const headers = {
        'token': `${token}`, // Example custom header
      };
      
      const requestBody = { query: question };
      const response = await axios.post('/api/ai-search', requestBody,{headers:headers});
      setAnswer(response?.data?.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-end"
      height="100vh"
      borderRadius="lg"
    >
      <Box
        width="80%"
        p="2"
        borderRadius="lg"
        bgColor="gray.200"
        overflowY="auto"
        height="300px"
        maxH="70vh"
        mb="2"
      >
        
            <Box
              p="2"
              borderRadius="lg"
              maxWidth="70%"
              wordBreak="break-word"
            >
              {answer}
            </Box>
          
      </Box>
      <Flex width="80%" alignItems="center">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type a message..."
          flex="1"
          mr="2"
        />
        <IconButton
          aria-label="Send"
          icon={<AddIcon />}
          bgColor="blue.300"
          color="white"
          onClick={answerQuestion}
          disabled={loading}
        />
      </Flex>
    </Flex>
  );
}

export default ChatbotUI;
