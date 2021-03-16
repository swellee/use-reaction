import { Tree } from "antd"
import { useModel } from "use-reaction"
import { mirror_model } from "./model_mirror"
import { DownOutlined } from '@ant-design/icons'
import { useEffect, useState } from "react"
export const ModelTree = () => {
    const { store: { models } } = useModel(mirror_model)
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
                item.children.push(generateTree(obj[key], key))
            }
        } else {
            item.title = `${subkey}: ${obj}`
            delete item.children
        }

        return item
    }
    useEffect(() => {
        const data = generateTree(models, 'global-store', {})
        setTreeData([data])

    }, [models])
    return <Tree
        switcherIcon={<DownOutlined />}
        treeData={treeData}
    />

}