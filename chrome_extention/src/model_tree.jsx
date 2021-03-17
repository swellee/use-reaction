import { Tree } from "antd"
import { useModel } from "use-reaction"
import { mirror_model } from "./model_mirror"
import { DownOutlined } from '@ant-design/icons'
import { useEffect, useState } from "react"
const LOADING_TAG = 'USE::REACTION::BUILTIN:LOADING'
export const ModelTree = (props) => {
    const { store: { viewModel, viewTitle } } = useModel(mirror_model)
    const [treeData, setTreeData] = useState([])

    const generateTree = (obj, subkey) => {
        const item = {
            title: subkey,
            key: subkey
        }
        item.children = item.children || []

        if (Array.isArray(obj)) {
            item.children.push(...obj.map((item, idx) => generateTree(item, `${subkey}[${idx}]`)))
        }
        else if (typeof obj === 'object') {
            for (let key in obj) {
                if (key !== LOADING_TAG) {
                    item.children.push(generateTree(obj[key], key))
                }
            }
        } else {
            item.title = `${subkey}: ${obj}`
            delete item.children
        }

        return item
    }
    useEffect(() => {
        const data = generateTree(viewModel, 'click to view details', {})
        setTreeData([data])

    }, [viewModel])
    return <div className="data-view">
        <h2>{viewTitle}</h2>
        <Tree
            switcherIcon={<DownOutlined />}
            treeData={treeData}
        />
    </div>

}