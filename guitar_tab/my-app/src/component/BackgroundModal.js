import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { RaceBy } from '@uiball/loaders'



function BackgroundModal(props) {
  const {isLoading} = props;

  return (
    <>
      <Modal
        show={isLoading}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header >
          <Modal.Title>製作中</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          等待TAB譜處理中...
        </Modal.Body>
        <Modal.Footer>
            <RaceBy 
            size={500}
            lineWeight={5}
            speed={1.4} 
            color="black" 
            />
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default BackgroundModal;