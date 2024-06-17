import { useState, useEffect, useCallback, useMemo } from 'react';
import { isEmpty, isArray, forEach } from 'lodash-es';
import ReactFlow from 'reactflow';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import InsuredNode, { STATUS_MAP } from './components/InsuredNode';
import CircularProgress from '@mui/material/CircularProgress';
import { getInsured, getParentInsured } from './mocks';

import 'reactflow/dist/style.css';

const numberOnlyRegex = /^[0-9]*$/;

const defaultInputState = {
  searchId: '',
  error: false,
  errorText: '',
}

/**
 *  @description flatten tree with record parent code and field
*/
const flattenAndRecord = (insured, parentCode = null, field = null, result = [], layer = 0) => {
  const newLayer = layer + 1;

  const newObj = {
    code: insured.code,
    name: insured.name,
    introducerCode: insured.introducer_code,
    parentCode,
    field,
    layer: newLayer,
  };

  result.push(newObj);

  if (isArray(insured.l) && !isEmpty(insured.l)) {
    forEach(insured.l, child => flattenAndRecord(child, insured.code, 'l', result, newLayer));
  }

  if (isArray(insured.r) && !isEmpty(insured.r)) {
    forEach(insured.r, child => flattenAndRecord(child, insured.code, 'r', result, newLayer));
  }

  return result;
}

/**
 * @description convert data to react flow data
 * @param {Array} data result from flattenAndRecord
*/
const toReactFlowData = (data = [], onClickCode, onClickAction) => {
  const searchCode = data[0].code;
  const axisMap = {};
  const nodes = [];
  const edges = [];

  forEach(data, (item) => {
    const { code, name, introducerCode, parentCode, field, layer } = item;

    // create node
    const newNode = {
      id: code,
      data: {
        label: name,
        code,
        name,
        parentCode,
        onClickCode,
        onClickAction,
      },
      type: 'insuredNode',
      connectable: false,
      draggable: false,
      resizing: false,
      deletable: false,
    };

    const hasParent = parentCode && axisMap[parentCode];
    if (hasParent) {
      const parentPosition = axisMap[parentCode];
      let xAsisGap = 0;
      switch(layer) {
        case 2:
          xAsisGap = 600;
          break;
        case 3:
          xAsisGap = 300;
          break;
        case 4:
          xAsisGap = 150;
          break;
        case 5:
          xAsisGap = 80;
          break;
        default:
          xAsisGap = 50;
      }
      const position = {
        x: parentPosition.x + (field === 'l' ? -xAsisGap : xAsisGap),
        y: parentPosition.y + 150,
      };

      axisMap[code] = position;
      newNode.position = position;
      newNode.data.status = introducerCode === searchCode ? STATUS_MAP.INTRODUCED : STATUS_MAP.NOT_INTRODUCED;
    } else {
      const position = { x: 0, y: 0}
      axisMap[code] = position;
      newNode.position = position;
      newNode.data.status = STATUS_MAP.SEARCH_TARGET;
    }

    nodes.push(newNode);

    // create edge
    if (parentCode) {
      const edgeId = `${parentCode}-${code}`;
      const source = parentCode;
      const target = code;
      const edge = { id: edgeId, source, target, type: 'step' };
      edges.push(edge);
    }
  });

  return { nodes, edges }
}

const App = () => {
  const [inputState, setInputState] = useState(defaultInputState);
  const [response, setResponse] = useState({});
  const [loading, setLoading] = useState(false);
  const [flowData, setFlowData] = useState({ nodes: [], edges: [] });

  const nodeTypes = useMemo(() => ({ insuredNode: InsuredNode }), []);

  const handleSearch = useCallback(async (code) => {
    setLoading(true);
    const result = await getInsured(code)
    if (!result) {
      setInputState((prev) => ({ ...prev, error: true, errorText: '查無此保戶' }))
    } else {
      setResponse(result);
    }
    setLoading(false);
  }, []);

  const onClickNodeCode = useCallback((data) => {
    setInputState({ ...defaultInputState, searchId: data.code })
    handleSearch(data.code);
  }, [handleSearch])

  const onClickNodeAction = useCallback(async (data) => {
    setLoading(true);
    const result = await getParentInsured(data.code);
    setInputState({ ...defaultInputState, searchId: result.code })
    setResponse(result);
    setLoading(false);
  }, [])


  useEffect(() => {
    if (isEmpty(response)) return;
    const flattenData = flattenAndRecord(response);
    const flowData = toReactFlowData(flattenData, onClickNodeCode, onClickNodeAction);
    setFlowData(flowData);
  }, [response, onClickNodeCode, onClickNodeAction]);

  const onChangeInput = useCallback((e) => {
    const value = e.target.value;
    setInputState({
      ...inputState,
      searchId: value,
      error: !numberOnlyRegex.test(value),
      errorText: '請輸入數字',
    });
  }, [inputState])

  const onKeyDown = useCallback((e) => {
    if (e.keyCode !== 13) return;
    if (!inputState.searchId) return;
    if (inputState.error) return;
    handleSearch(inputState.searchId);
  }, [inputState, handleSearch])

  const onClickSearchButton = useCallback(() => {
    handleSearch(inputState.searchId);
  }, [handleSearch, inputState.searchId]);

  const renderFlow = () => {
    return isEmpty(response)
      ? <p>請輸入編號找查結果</p>
      : (
      <ReactFlow
        nodes={flowData.nodes}
        edges={flowData.edges}
        nodeTypes={nodeTypes}
      />
    )
  }

  return (
    <>
      <CssBaseline />
      <AppBar position="static" sx={{ paddingLeft: '1rem'}}>
        <p>保戶關係查詢</p>
      </AppBar>
      <Grid container direction="column" rowSpacing={2} p={2}>
        <Grid>
          <TextField
            value={inputState.searchId}
            onChange={onChangeInput}
            onKeyDown={onKeyDown}
            label="保戶編號"
            placeholder='請輸入保戶編號'
            variant="standard"
            error={inputState.error}
            helperText={inputState.error ? inputState.errorText : ' '}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={onClickSearchButton}
                    disabled={inputState.error || !inputState.searchId}
                    edge="end"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid
          container
          alignItems='center'
          justifyContent='center'
          sx={{ width: '100%', height: '75vh', border: '1px dotted', borderRadius:"4px" }}
        >
          {
            loading
            ? (<CircularProgress />)
            : renderFlow()
          }
        </Grid>
      </Grid>
    </>
  );
}

export default App;
