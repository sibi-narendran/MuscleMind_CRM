import React from 'react';
import { Card, Typography, Divider } from 'antd';

const { Title, Text } = Typography;

const UserProfile = () => {
  // Sample user data
  const user = {
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-boxdark shadow-md rounded-lg">
      <Card bordered={false}>
        <Title level={2}>User Profile</Title>
        <Divider />
        <div className="mb-4">
          <Text strong>Name: </Text>
          <Text>{user.name}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Title: </Text>
          <Text>{user.title}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Email: </Text>
          <Text>{user.email}</Text>
        </div>
        <div className="mb-4">
          <Text strong>Phone: </Text>
          <Text>{user.phone}</Text>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;
