import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function Page500() {
  const navigate = useNavigate()
  const backHomeFnc = () => {
    navigate(-1)
  }

  return (
    <Result
      status="500"
      title="500"
      subTitle="Sorry, something went wrong."
      extra={<Button onClick={backHomeFnc} type="primary">Quay về trang chủ</Button>}
    />
  )
}
