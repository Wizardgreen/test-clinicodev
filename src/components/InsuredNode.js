import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import styled from '@mui/system/styled';

const Wrapper = styled(Box)`
  position: relative;
`

export const STATUS_MAP = {
  SEARCH_TARGET: 'search-target',
  INTRODUCED: 'introduced',
  NOT_INTRODUCED: 'not-introduced',
}

const BACKGROUND_MAP = {
  [STATUS_MAP.SEARCH_TARGET]: '#F5CD7A',
  [STATUS_MAP.INTRODUCED]: '#3EC1D3',
  [STATUS_MAP.NOT_INTRODUCED]: '#596174',
};

const InsuredNode = (props) => {
  const { data = {} } = props;
  const { status, code, name, onClickCode = null, onClickAction = null } = data;

  const handleClickCode = useCallback(() => {
    if (onClickCode)  {
      onClickCode(data);
    }
  }, [data, onClickCode]);

  const handleClickAction = useCallback(() => {
    if (onClickAction)  {
      onClickAction(data);
    }
  }, [data, onClickAction]);

  return (
    <Wrapper className="insured-node-wrapper">
      <Handle type="target" position={Position.Top} />
      <Card
        variant="outlined"
        sx={{ background:  BACKGROUND_MAP[status], position: 'relative' }}
        >
        <CardContent>
          <Typography
            component={Link}
            onClickCapture={handleClickCode}
            sx={{ fontSize: 14, cursor:'pointer' }}
            color="text.secondary"
            gutterBottom
          >
            {code}
          </Typography>
          <Typography variant="h5" component="div">
            {name}
          </Typography>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} />
      {
        status === STATUS_MAP.SEARCH_TARGET && code !== '001' && (
          <Button
            onClick={handleClickAction}
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              transform: 'translate(100%)',
            }}
          >
            查上一層
          </Button>
        )
      }
    </Wrapper>
  );
}

export default InsuredNode;
