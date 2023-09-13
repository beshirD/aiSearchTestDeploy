import { useState } from 'react';
import axios from 'axios';
import { Input, Button, Box, Heading, Text, Spinner, Flex, VStack, useToast } from '@chakra-ui/react';
import { FileUpload } from '@roq/nextjs';
const SearchPage = () => {
  // const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState('');
  // const [question, setQuestion] = useState('');
  // const [responses, setResponses] = useState([]);
  // const [uploadLoading, setUploadLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  // const [searchLoading, setSearchLoading] = useState(false);
  // const [isFileSelected, setIsFileSelected] = useState(false);
  const [isLinkSelected, setIsLinkSelected] = useState(false);

  const toast = useToast();

  // const handleFileChange = (e: any) => {
  //   setSelectedFile(e.target.files[0]);
  //   setIsFileSelected(!!e.target.files[0]);
  // };
  const handleLinkChanged = (e: any) => {
    setSelectedUrl(e.target.value);
    //todo add function that checks if the link is valid
  };

  // const handleFileUpload = async () => {
  //   if (!selectedFile) return;

  //   const formData = new FormData();
  //   formData.append('file', selectedFile);

  //   try {
  //     setUploadLoading(true);
  //     await axios.post('/api/testupload/file_embedding_generator', formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  //     // const url = 'https://roq-ai-search-mvp.vercel.app/';
  //     // const loader = new PlaywrightWebBaseLoader(url);
  //     // const docs = await loader.load();
  //     // console.log(docs,"test docs");
  //     console.log('File uploaded successfully');
  //     toast({
  //       title: 'Upload Successful',
  //       status: 'success',
  //       duration: 3000,
  //       isClosable: true,
  //       position: 'top-right',
  //     });
  //     setSelectedFile(null);
  //     setIsFileSelected(false);
  //   } catch (error) {
  //     console.error('Error uploading file:', error);
  //     toast({
  //       title: 'Upload Error',
  //       description: 'An error occurred while uploading the file.',
  //       status: 'error',
  //       duration: 3000,
  //       isClosable: true,
  //       position: 'top-right',
  //     });
  //   } finally {
  //     setUploadLoading(false);
  //   }
  // };

  const handleLink = async () => {
    try {
      setUrlLoading(true);
      await axios.post('/api/testupload/link_embedding_generator', { link: selectedUrl });
      setIsLinkSelected(true);
      toast({
        title: 'link sent',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
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

  // const handleSearch = async () => {
  //   console.log(question, 'the query here');

  //   try {
  //     setSearchLoading(true);
  //     const requestBody = { query: question };
  //     const response = await axios.post('/api/testupload/search', requestBody);
  //     console.log(response, 'the response haha');
  //     setResponses([response?.data?.data, ...responses]);
  //   } catch (error) {
  //     console.log('error:', error);
  //   } finally {
  //     setSearchLoading(false);
  //   }
  // };

  // const clearResponses = () => {
  //   setResponses([]);
  //   setQuestion('');
  // };

  return (
    <Box p="4" maxH="full">
      <Box mt="4" border="1px" borderColor="gray.600" borderStyle="dashed" minH={120} p="4" borderRadius="md">
        <Heading size="md">File Upload</Heading>

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
                await axios.post('/api/testupload/file_embedding_generator', formData, {
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

      {/*  */}
    </Box>
  );
};

export default SearchPage;
