import React, {useEffect, useState} from 'react';
import {nanoid} from 'nanoid';
import client from 'part:@sanity/base/client';
import styled from 'styled-components';
import {useToast, Box, Card, Button, Spinner, Dialog} from '@sanity/ui';
import axios from 'axios';

import DeployModalEdit from './DeployModalEdit';


const DeployItem = ({hook}) => {
	const toast = useToast();
	const [lastDeploy, setLastDeploy] = useState(nanoid());
    const [isEditWebhookModalOpen, setEditWebhookModalOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
    const [status, setStatus] = useState({});
	const [isConfirmOpen, setConfirmOpen] = useState(false);

    React.useEffect(() => {
        getDeployStatus();
    }, []);

    const getDeployStatus = () => {
       axios.get(hook.statusBadgeUrl, {
            headers: {
              'Authorization': `${hook.githubToken}` 
            }
          }).then(bdg =>setStatus({status: bdg?.data?.workflow_runs[0]?.status ?? '', time: new Date(bdg?.data?.workflow_runs[0]?.run_started_at).toDateString() ?? '' }  ));
    }

	const onDelete = async () => {
		setIsDeleting(true);

		try {
			await client.delete(hook._id);
		} catch (error) {
			toast.push({
				status: 'error',
				title: 'An error occured in deleting this webhook.',
			});
		}

		setIsDeleting(false);

		toast.push({
			status: 'success',
			title: `Deleted ${hook.title}!`,
		});

		setConfirmOpen(false);
	};

    
        
    const statusText = (stat) => {
        if(stat === 'completed' || stat === 'success') {
            return '#339900';
        }else if(stat === 'in_progress' || stat === 'queued') {
            return '#ff9966';
        } else {
            return '#cc3300';
        }
    }
	const onDeploy = async () => {
		try {
            await axios.post(hook.url, hook.githubBody, {
                headers: {
                  'Authorization': `${hook.githubToken}` 
                }});
		} catch (error) {
			toast.push({
				status: 'error',
				title: 'An error occured in deploying this webhook.',
			});
		}

		setLastDeploy(nanoid());

		toast.push({
			status: 'success',
			title: `Deployed ${hook.title}!`,
		});
	};

	const confirmDialog = isConfirmOpen && (
		<Dialog
			width={1}
			header={`Delete ${hook.title}`}
			onClose={() => setConfirmOpen(false)}>
			<Box padding={4} paddingTop={0}>
				<Box marginBottom={4}>
					<p>
						This deletes your deploy button, but will not delete the
						environment. This is a permanent action. You'll need to
						re-add this environment.
					</p>
				</Box>
				{isDeleting ? (
					<Spinner />
				) : (
					<Button
						tone="critical"
						text="Permanently Delete"
						onClick={onDelete}
					/>
				)}
			</Box>
		</Dialog>
	);

	const CardRow = styled.div`
		display: flex;
		flex-direction: column;
		@media (min-width: 1000px) {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	`;

	const MetaContainer = styled.div`
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin-bottom: 20px;
		@media (min-width: 1000px) {
			flex-direction: row;
			margin-bottom: 0;
		}
	`;

	const MetaColumn = styled.div`
		margin-bottom: 5px;
		@media (min-width: 1000px) {
			margin-bottom: 0;
			margin-right: 10px;
		}
	`;

	const ActionsContainer = styled.div`
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		@media (min-width: 1000px) {
			align-items: flex-end;
		}
	`;

    const editWebhookModal = isEditWebhookModalOpen && (
		<DeployModalEdit hook={hook} onClose={() => setEditWebhookModalOpen(false)} />
	);
       
	return (
        <Box>
        {editWebhookModal}
    
		<Card padding={4} radius={2} shadow={1}>
			<CardRow>
				<MetaContainer>
					<MetaColumn>
						<p style={{margin: 0}}>{hook.title || 'Netlify'}</p>
					</MetaColumn>
					<MetaColumn>
						<span>Sist startet: {(status.time)}</span>
					</MetaColumn>
                    <MetaColumn>
					<span style={{color: statusText(status.status)}}>{status.status}</span>
                    </MetaColumn>
				</MetaContainer>
				<ActionsContainer>
					<Box>
						<Button
							tone="positive"
							text="Refresh"
							onClick={() => getDeployStatus()}
						/>
					</Box>
                    <Box marginLeft={2}>
						<Button
							tone="positive"
							text="Edit"
							onClick={() => setEditWebhookModalOpen(true)}
						/>
					</Box>
                    <Box marginLeft={2}>
						<Button
							tone="critical"
							text="Delete"
							onClick={() => setConfirmOpen(true)}
						/>
					</Box>
					<Box marginLeft={2}>
						<Button
							tone="primary"
							text="Start Deploy"
							onClick={onDeploy}
						/>
					</Box>
				</ActionsContainer>
			</CardRow>
			{confirmDialog}
		</Card>
        </Box>
	);
};

export default DeployItem;