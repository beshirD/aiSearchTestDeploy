import { Flex, Box, Input, IconButton, Spinner } from '@chakra-ui/react';
import { useState } from 'react';
import axios from 'axios';
import { FiSend } from 'react-icons/fi';

function ChatbotUI({ token }: any) {
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);

  const answerQuestion = async () => {
    setLoading(true);
    try {
      const headers = {
        token: `${token}`,
      };

      const requestBody = { query: inputQuestion };
      const response = await axios.post('/api/ai-search', requestBody, { headers: headers });

      const newHistoryItem = { question: inputQuestion, answer: response?.data?.data };

      setHistory((prevHistory) => [...prevHistory, newHistoryItem]);
    } catch (error) {
    } finally {
      setLoading(false);
      setInputQuestion('');
    }
  };

  return (
    <Flex flexDirection="column" alignItems="center" justifyContent="flex-end" borderRadius="lg" mt="5">
      <Flex width="full" alignItems="center">
        <Input
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Type a message..."
          flex="1"
          mr="2"
        />
        <IconButton
          aria-label="Send"
          icon={loading ? <Spinner size="sm" /> : <FiSend />}
          bgColor="blue.300"
          color="white"
          onClick={answerQuestion}
          disabled={loading}
        />
      </Flex>
      <Box
        border="1px"
        borderColor="gray.600"
        borderStyle="dashed"
        minH={120}
        p="4"
        borderRadius="md"
        width="full"
        mt="4"
        mb="2"
      >
        {history
          .slice()
          .reverse()
          .map((item, index) => (
            <div key={index}>
              <Box width="fit-content" p="2" borderRadius="lg" bgColor="cyan.200" color="black" mb="2" minH="1.5">
                {item.question}
              </Box>
              <Box width="full" p="2" borderRadius="lg" bgColor="gray.200" color="black" mb="2" minH="1.5">
                {item.answer}
              </Box>
            </div>
          ))}
      </Box>
    </Flex>
  );
}

export default ChatbotUI;
