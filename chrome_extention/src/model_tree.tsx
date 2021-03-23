import React from 'react'
import { Button, Empty, Tree } from "antd"
import { MirrorModel, mirror_model, TAB_MODELS, TITLE_VIEW_GLOBAL, viewGlobal } from "./model_mirror"
import { DownOutlined } from '@ant-design/icons'
import { mapProp, KV, doAction } from "module-reaction"
const LOADING_TAG = 'USE::REACTION::BUILTIN:LOADING'
const MODEL_KEY_PRE = 'USE::REACTION::MODULE::'
const MODEL_TAG = '__MODULE__'

let unNamedModelIdx = 0
@mapProp(mirror_model)
export class ModelTree extends React.Component<Partial<MirrorModel>, KV> {
    state = {
        treeData: []
    }
    static generateTree(obj: any, subkey: string, lvl: number = 0) {
        if (subkey === MODEL_TAG) {
            return undefined
        }
        const item: KV = {
            title: subkey,
            key: subkey + lvl,
        }
        item.children = item.children || []

        if (Array.isArray(obj)) {
            item.children.push(...(obj.map((item, idx) => ModelTree.generateTree(item, `${subkey}[${idx}]`, ++lvl)).filter(Boolean)))
        } else if (typeof obj === 'object') {
            for (let key in obj) {
                if (key !== LOADING_TAG) {
                    const child = ModelTree.generateTree(obj[key], key.startsWith(MODEL_KEY_PRE) ? `anonymous_model_${++unNamedModelIdx}` : key, ++lvl)
                    child && item.children.push(child)
                }
            }
        } else {
            item.title = `${subkey}: ${obj}`
            delete item.children
        }

        return item
    }

    componentDidMount() {
        this.updateTree(this.props)
    }
    componentWillReceiveProps(props: KV) {
        this.updateTree(props)
    }
    updateTree(props: KV) {
        const { viewModel, models, viewTitle } = props
        unNamedModelIdx = 0
        this.setState({ treeData: [ModelTree.generateTree(viewTitle === TITLE_VIEW_GLOBAL ? models : viewModel, 'data-tree')] })
    }
    render() {
        let { treeData } = this.state
        console.log('treeData', treeData)
        const { viewTitle } = this.props
        return <div className="data-view">
            <h2>{viewTitle} </h2>
            {
                treeData?.length ?
                    <Tree
                        className="data-tree"
                        switcherIcon={<DownOutlined />}
                        treeData={treeData}
                    /> : <div className="empty-tip">
                        <Empty description={<span>
                            currently viewing data is empty,
                        or you can view <Button onClick={e => doAction(viewGlobal)}>global models</Button>
                        </span>}></Empty>
                    </div>
            }
        </div>
    }
}