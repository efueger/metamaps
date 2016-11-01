/* global $ */

import Active from './Active'
import Control from './Control'
import JIT from './JIT'
import Mobile from './Mobile'
import Realtime from './Realtime'
import Selected from './Selected'
import Topic from './Topic'
import Util from './Util'
import Visualize from './Visualize'
import { Search } from './GlobalUI'

const Listeners = {
  init: function () {
    var self = this
    $(document).on('keydown', function (e) {
      if (!(Active.Map || Active.Topic)) return

      const onCanvas = e.target.tagName === 'BODY'

      switch (e.which) {
        case 13: // if enter key is pressed
          // prevent topic creation if sending a message
          if (e.target.className !== 'chat-input') {
            JIT.enterKeyHandler()
          }
          break
        case 27: // if esc key is pressed
          JIT.escKeyHandler()
          break
        case 65: // if a or A is pressed
          if ((e.ctrlKey || e.metaKey) && onCanvas) {
            Control.deselectAllNodes()
            Control.deselectAllEdges()

            e.preventDefault()
            Visualize.mGraph.graph.eachNode(function (n) {
              Control.selectNode(n, e)
            })

            Visualize.mGraph.plot()
          }

          break
        case 68: // if d or D is pressed
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            Control.deleteSelected()
          }
          break
        case 69: // if e or E is pressed
          if ((e.ctrlKey || e.metaKey) && Active.Map) {
            e.preventDefault()
            JIT.zoomExtents(null, Visualize.mGraph.canvas)
            break
          }
          if (e.altKey && Active.Topic) {
            e.preventDefault()

            if (Active.Topic) {
              self.centerAndReveal(Selected.Nodes, {
                center: true,
                reveal: false
              })
            }
            break
          }
          break
        case 72: // if h or H is pressed
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            Control.hideSelectedNodes()
            Control.hideSelectedEdges()
          }
          break
        case 77: // if m or M is pressed
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            Control.removeSelectedNodes()
            Control.removeSelectedEdges()
          }
          break
        case 82: // if r or R is pressed
          if (e.altKey && Active.Topic) {
            e.preventDefault()
            self.centerAndReveal(Selected.Nodes, {
              center: false,
              reveal: true
            })
          }
          break
        case 84: // if t or T is pressed
          if (e.altKey && Active.Topic) {
            e.preventDefault()
            self.centerAndReveal(Selected.Nodes, {
              center: true,
              reveal: true
            })
          }
          break
        case 191: // if / is pressed
          if (e.ctrlKey || e.metaKey) {
            Search.focus()
          }
          break
        default:
          // console.log(e.which)
          break
      }
    })

    $(window).resize(function () {
      if (Visualize && Visualize.mGraph) {
        Util.resizeCanvas(Visualize.mGraph.canvas)
      }

      if (Active.Map && Realtime.inConversation) Realtime.positionVideos()
      Mobile.resizeTitle()
    })
  },
  centerAndReveal: function (nodes, opts) {
    if (nodes.length < 1) return
    var node = nodes[nodes.length - 1]
    if (opts.center && opts.reveal) {
      Topic.centerOn(node.id, function () {
        Topic.fetchRelatives(nodes)
      })
    } else if (opts.center) {
      Topic.centerOn(node.id)
    } else if (opts.reveal) {
      Topic.fetchRelatives(nodes)
    }
  }
}

export default Listeners