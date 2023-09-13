import { useState } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { Input, Button, Box, Heading, Flex, useToast, FormControl, FormErrorMessage } from '@chakra-ui/react';
import { FileUpload } from '@roq/nextjs';
import ChatbotUI from 'components/search-component';

// Create a yup schema for URL validation
const urlSchema = Yup.string().url('Invalid URL format').required('URL is required');

const SearchPage = ({ apiKey }: { apiKey: string }) => {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [isLinkSelected, setIsLinkSelected] = useState(false);
  const [urlError, setUrlError] = useState('');

  const toast = useToast();

  const handleLinkChanged = (e: any) => {
    setSelectedUrl(e.target.value);
  };

  const handleLink = async () => {
    try {
      setUrlLoading(true);

      // Validate the URL using yup schema
      try {
        await urlSchema.validate(selectedUrl);
        setUrlError('');
      } catch (error: any) {
        setUrlError(error.message);
        setUrlLoading(false);
        return;
      }

      await axios.post(`/api/upload/link_embedding_generator/${apiKey}`, { link: selectedUrl });
      setIsLinkSelected(true);
      toast({
        title: 'Link sent',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error uploading link:', error);
      toast({
        title: 'Link Upload Error',
        description: 'An error occurred while uploading the link.',
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
    <Box>
      <Flex>
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
            <Box display="flex">
              <FormControl isInvalid={!!urlError}>
                <Input type="text" onChange={handleLinkChanged} p={1} width="md" />
                <FormErrorMessage>{urlError}</FormErrorMessage>
              </FormControl>

              <Button
                colorScheme="cyan"
                onClick={handleLink}
                isDisabled={urlLoading}
                isLoading={urlLoading}
                loadingText="Learning..."
                ml={3}
                transition="opacity 0.2s ease-in-out"
                _loading={{ opacity: 0.8 }}
              >
                Add URL
              </Button>
            </Box>
          </Box>
        </Box>
        {/*  */}
      </Flex>
      <ChatbotUI token={apiKey} />
    </Box>
  );
};

export default SearchPage;
