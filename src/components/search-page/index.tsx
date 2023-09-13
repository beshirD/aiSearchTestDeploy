import { useState } from 'react';
import axios from 'axios';
import { Input, Button, Box, Heading, Text, Spinner, Flex, VStack, useToast } from '@chakra-ui/react';
import { FileUpload } from '@roq/nextjs';
import ChatbotUI from 'components/search-component';
const SearchPage = ({ apiKey }: { apiKey: string }) => {
  const [selectedUrl, setSelectedUrl] = useState('');

  const [urlLoading, setUrlLoading] = useState(false);
  const [isLinkSelected, setIsLinkSelected] = useState(false);

  const toast = useToast();

  const handleLinkChanged = (e: any) => {
    setSelectedUrl(e.target.value);
    //todo add function that checks if the link is valid
  };

  const handleLink = async () => {
    try {
      setUrlLoading(true);
      await axios.post(`/api/upload/link_embedding_generator/${apiKey}`, { link: selectedUrl });
      setUrlLoading(false);

      setIsLinkSelected(true);
      toast({
        title: 'link sent',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      setUrlLoading(true);
      console.error('Error uploading file:', error);
      toast({
        title: 'link Upload Error',
        description: 'An error occurred while uploading the file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setUrlLoading(false);
    }
  };

  return (
    <Box maxH="full">
      <Flex direction="row" align="center" justify="space-between">

      <Box>
        <Box mt="4" border="1px" borderColor="gray.600" borderStyle="dashed" minH={120} p="4" borderRadius="md">
          <Heading size="md" mb="2">
            File Upload
          </Heading>

          <FileUpload
            accept={['*']}
            fileCategory="USER_FILES"
            onUploadSuccess={({ url, name, ...rest }) => {
              (async () => {
                try {
                  const response = await fetch(url);
                  const blob = await response.blob();

                  const formData = new FormData();
                  formData.append('file', blob, name);
                  await axios.post(`/api/upload/file_embedding_generator/${apiKey}`, formData, {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                    },
                  });

                  toast({
                    title: 'Upload Successful',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                  });
                } catch (error) {
                  console.error('Error uploading file:', error);
                  toast({
                    title: 'Upload Error',
                    description: 'An error occurred while uploading the file.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                  });
                }
              })();
            }}
          />
        </Box>

        <Box mt="4" border="1px" borderColor="gray.600" borderStyle="dashed" minH={120} p="4" borderRadius="md">
          <Heading size="md">URLs</Heading>

          <Input type="text" onChange={handleLinkChanged} p={1} width="md" />

          <Button
            colorScheme="cyan"
            onClick={handleLink}
            isLoading={urlLoading}
            loadingText="Uploading..."
            isDisabled={isLinkSelected}
            ml={3}
          >
            {urlLoading ? 'learning...' : 'Add URL'}
          </Button>
        </Box>
      </Box>
      {/*  */}
            <ChatbotUI token={apiKey}/>
      </Flex>

    </Box>
  );
};

export default SearchPage;
